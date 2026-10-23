'use strict';
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
// Run the real app: navigation back to / must open the Lyric Shadows home.
process.env.PORT = process.env.VOICE_PRACTICE_PORT || '10001';
process.env.PET_WORKER_AUTO ||= 'false';
require('../server');
