'use strict';
const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
process.env.PORT=process.env.SENTENCE_GAME_PORT||'10001';
process.env.PET_WORKER_AUTO||='false';
require('../server');
