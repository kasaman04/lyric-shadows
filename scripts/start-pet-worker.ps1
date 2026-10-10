$env:NODE_PATH = Join-Path $PSScriptRoot '../../英語字幕/node_modules'
Set-Location (Join-Path $PSScriptRoot '..')
node lib/pet-worker.js
