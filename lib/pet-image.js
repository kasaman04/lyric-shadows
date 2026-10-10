'use strict';
const zlib = require('zlib');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const rules = require('../public/pet-rules');
const STARTER_URL = '/pet-images/baby-v2.png';
const STARTER_PATH = path.join(__dirname, '..', 'public', 'pet-images', 'baby-v2.png');
function validateImage(bytes, { columns=1, rows=1 } = {}) {
  if (!Buffer.isBuffer(bytes) || bytes.length > 20 * 1024 * 1024 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Character must be a PNG image');
  let offset = 8, width, height, compressed = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    if (offset + 12 + length > bytes.length) throw new Error('Truncated PNG');
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (!width || !height || width > 4096 || height > 4096 || width * height > 8388608 || data[8] !== 8 || data[9] !== 6 || data[12] !== 0) throw new Error('Character needs an 8-bit RGBA PNG');
    }
    if (type === 'IDAT') compressed.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  if (!width || !height || !compressed.length) throw new Error('Incomplete PNG');
  const row = width * 4, raw = zlib.inflateSync(Buffer.concat(compressed), { maxOutputLength: height * (row + 1) });
  if (raw.length !== height * (row + 1)) throw new Error('Invalid PNG pixels');
  let previous = Buffer.alloc(row), transparent = 0, visible = 0;
  const cells=Array(columns*rows).fill(0);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (row + 1)], current = Buffer.alloc(row);
    if (filter > 4) throw new Error('Invalid PNG filter');
    for (let x = 0; x < row; x++) {
      const left = x >= 4 ? current[x - 4] : 0, up = previous[x], corner = x >= 4 ? previous[x - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - corner, a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - corner);
        predictor = a <= b && a <= c ? left : b <= c ? up : corner;
      }
      current[x] = (raw[y * (row + 1) + 1 + x] + predictor) & 255;
      if (x % 4 === 3) { if (current[x] === 0) transparent++; if (current[x] > 128) {visible++;cells[Math.min(rows-1,Math.floor(y/height*rows))*columns+Math.min(columns-1,Math.floor(Math.floor(x/4)/width*columns))]++;} }
    }
    previous = current;
  }
  if (transparent < width * height * .01 || visible < width * height * .02) throw new Error('Character must have a real transparent background and visible artwork');
  if(cells.some(count=>count<width*height/(columns*rows)*.02))throw new Error('Every animation cell needs visible artwork');
  return { width, height, transparent: true };
}
class PetImages {
  constructor({ dir = path.join(process.env.PET_DATA_DIR || path.join(__dirname, '..', 'data', 'pets'), 'images'), remote = null } = {}) { this.dir = path.resolve(dir); this.remote=remote; }
  async save(bytes) {
    const metadata = validateImage(bytes), hash = crypto.createHash('sha256').update(bytes).digest('hex');
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(path.join(this.dir, hash + '.png'), bytes, { flag: 'wx' }).catch(e => { if (e.code !== 'EEXIST') throw e; });
    if(this.remote)await this.remote.put('portraits/'+hash+'.png',bytes);
    return { imageUrl: '/api/pet-art/' + hash + '.png', imageSource: 'app-server:image-generation', imageSize: { width: metadata.width, height: metadata.height } };
  }
  async saveMotion(bytes, petId) {
    if (!/^[a-f0-9-]{36}$/.test(petId || '')) throw new Error('Motion owner is required');
    const metadata = validateImage(bytes,{columns:4,rows:7}), hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (Math.abs(metadata.width / metadata.height - 4 / 7) > .04) throw new Error('Motion sheet must have four columns and seven rows');
    const dir = path.join(this.dir, 'motion', petId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, hash + '.png'), bytes, { flag:'wx' }).catch(e => { if(e.code !== 'EEXIST') throw e; });
    if(this.remote)await this.remote.put('motion/'+petId+'/'+hash+'.png',bytes);
    return { url:`/api/pet-motion/${petId}/${hash}.png`, columns:4, rows:7, frameCount:28, fps:6, width:metadata.width, height:metadata.height, source:'app-server:image-generation' };
  }
  async retireMotion(url, petId) {
    const match = /^\/api\/pet-motion\/([a-f0-9-]{36})\/([a-f0-9]{64})\.png$/.exec(url || '');
    if (match && match[1] === petId) {
      if(this.remote)await this.remote.remove('motion/'+petId+'/'+match[2]+'.png');
      await fs.unlink(path.join(this.dir,'motion',petId,match[2]+'.png')).catch(e=>{if(e.code !== 'ENOENT')throw e;});
    }
  }
  async read(hash,petId) {
    if(!/^[a-f0-9]{64}$/.test(hash)||petId&&!/^[a-f0-9-]{36}$/.test(petId))throw new Error('Invalid image');
    const name=petId?'motion/'+petId+'/'+hash+'.png':'portraits/'+hash+'.png';
    const file=petId?path.join(this.dir,'motion',petId,hash+'.png'):path.join(this.dir,hash+'.png');
    try{return await fs.readFile(file);}catch(e){if(e.code!=='ENOENT'||!this.remote)throw e;}
    const bytes=await this.remote.get(name);
    await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);
    return bytes;
  }
  async referenceReady(url) {
    const match=/^\/api\/pet-art\/([a-f0-9]{64})\.png$/.exec(url||'');
    if(match)await this.read(match[1]);
    return this.reference(url);
  }
  reference(url) {
    const match = /^\/api\/pet-art\/([a-f0-9]{64})\.png$/.exec(url || '');
    if (match) return path.join(this.dir, match[1] + '.png');
    if (/^\/pet-images\/starter-(fire|water|grass|thunder|ice|wind|earth|poison|light|dark)-v1\.png$/.test(url || '')) return path.join(__dirname,'..','public',url.slice(1));
    return STARTER_PATH;
  }
  async readGenerated(item, workdir) {
    if (item?.status !== 'completed' || item.failure || item.transparentBackground === false) throw new Error('Image generation did not produce a transparent character');
    if (item.savedPath) {
      const file = path.resolve(item.savedPath), roots = [path.resolve(workdir), path.join(os.homedir(), '.codex', 'generated_images')];
      const allowed = candidate => roots.some(root => { const relative = path.relative(root, candidate); return relative && !relative.startsWith('..') && !path.isAbsolute(relative); });
      if (!allowed(file)) throw new Error('Generated image path is outside its output directory');
      const actual = await fs.realpath(file);
      if (!allowed(actual)) throw new Error('Generated image path is outside its output directory');
      return fs.readFile(actual);
    }
    const raw = String(item.result || '').replace(/^data:image\/png;base64,/, '');
    if (!raw || raw.length > 28 * 1024 * 1024 || !/^[a-zA-Z0-9+/=\r\n]+$/.test(raw)) throw new Error('Image generation did not return PNG bytes');
    return Buffer.from(raw, 'base64');
  }
}
function migrateImages(state) {
  for (const pet of state.pets) for (const form of [...pet.forms,...(pet.legacyForms||[])]) if (form.level === 1 && (!form.imageUrl || form.imageUrl === '/pet-images/baby-v1.png')) {
    form.imageUrl = STARTER_URL; form.imageSource = 'imagegen';
  }
}
function evolutionPrompt(species, form) {
  const element=rules.element(form.element||species.element)||rules.element('grass');
  return `Generate ONE real raster character PNG using the built-in image generation tool exactly once, with transparent_background=true. Attached image is the previous portrait of the SAME individual. Element stays ${element.label} (${element.design}); species ${species.name}; level ${form.level}/10; immutable care stats ${JSON.stringify(form.stats)}; dominant direction ${form.direction||rules.dominant(form.stats)}. Preserve the element, palette, tiny black pill eyes (cream eyes for dark), tiny mouth and signature head feature. Body score grows soft broad torso/belly, power grows large arms or feet, brain grows bizarre head structures, curls, tails or elemental protrusions. Lv.2 is a modest growth; by Lv.10 become a HUGE strange cute mildly grotesque monster, with its baby identity still recognizable. Every level visibly evolves from the previous image, not just scaling. Hands are EMPTY: never a bowl, plate, utensils, toys or held props. Thick hand-drawn black outlines, simple flat pastel colors, no 3D gloss, no franchise characters or horror/gore. One full body front view neutral pose, square canvas, 72% canvas height, centered with generous margins and feet at 85% height. Actual alpha transparency, no floor, shadow, room, checkerboard, text, or UI. Use image generation, never code/SVG/shell/Python/web. Finish after generating the PNG.`;
}
function motionPrompt(form) {
  return `Generate ONE transparent raster PNG SPRITE SHEET with the native image generation tool exactly once, transparent_background=true. The attached portrait is the exact character identity reference. Keep that SAME creature, silhouette, colors, face, elemental feature, outline thickness and proportions in ALL frames. Level ${form.level}, element ${form.element}, care stats ${JSON.stringify(form.stats)}. No text, numbers, borders, labels, UI, floor shadows or checkerboard. Actual transparent gaps.
Canvas exactly 1024x1792 pixels, an EDGE-TO-EDGE regular grid of FOUR columns and SEVEN rows, 28 equal 256x256 cells. NO outer margins, gutters or extra cells. Every cell contains ONE whole creature centered at x=128 in its own cell; feet baseline y=220; normal height about 185 pixels with all limbs inside cell. Frames are distinct animation poses, not identical copies. Hands and mouth genuinely change position. Grid order is left to right then top to bottom, indices 0 through 27:
ROW 1 (0-3) idle: neutral standing; gentle inhale; eyes closed blink; gentle exhale eyes open.
ROW 2 (4-7) eating: hand starts toward mouth; hand touches mouth with mouth open; cheeks puff and mouth closed chewing; hand down with mouth open chewing.
ROW 3 (8-11): food satisfied eyes-closed smile; food finishes neutral content. Then power squat arms low; power squat charging with arms bent.
ROW 4 (12-15) power: arms spread; arms raised and flexed; firm stomp with knees bent; triumphant relaxed standing.
ROW 5 (16-19) thinking: head tilted left; head tilted right; one hand at temple with wondering mouth; eyes widen in realization.
ROW 6 (20-23): thinking pleased smile; thinking finishes neutral. Then hungry hand on belly; hungry leans forward pleading.
ROW 7 (24-27): hungry waves one hand toward viewer; hungry droops sadly. Then weak seated slouch; weak seated head drooped and half-closed eyes.
Do NOT add food, utensils, bowls, bulbs or other props; the game overlays those separately. Consistent flat hand-drawn 2D style. Do not alter the character's basic anatomy or palette between frames. Use native image generation only, never shell/code/SVG/Python. Finish after producing the sheet.`;
}
module.exports = { PetImages, validateImage, STARTER_URL, STARTER_PATH, migrateImages, evolutionPrompt, motionPrompt };
