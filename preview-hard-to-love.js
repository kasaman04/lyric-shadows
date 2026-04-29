const { prepareConversation } = require('./lib/generate');
const fs = require('fs');
const path = require('path');

const contextHint = `
【絶対の前提条件】
この会話は「大人になり立派に成長した元・不良の教え子（Speaker A）」と、「絶対に見捨てずに更生させてくれた恩師（Speaker B）」の感動的な再会シーンです。
教え子が恩師の元を訪れ、昔の感謝を伝える内容にしてください。
歌詞の "blood in my veins" は文字通りの血縁ではなく、「先生の教えや熱い魂が、今も自分の恩師から受け継いだ血脈として流れている」という比喩表現として自然に組み込んでください。
関係性は "恩師と元・教え子" にしてください。
`;

async function main() {
  const prepared = await prepareConversation("Hard To Love", "ONE OK ROCK", path.join(__dirname, 'songs'), {
    onStatus: msg => console.log(msg),
    contextHint
  });
  
  fs.writeFileSync('hard-to-love-preview.json', JSON.stringify(prepared, null, 2), 'utf8');
  console.log("DONE");
}

main().catch(console.error);
