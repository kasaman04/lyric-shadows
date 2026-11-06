param([string]$NodeExecutable = 'node.exe')
$gradeNodeModules = Join-Path $PSScriptRoot '../node_modules'
if (-not (Test-Path -LiteralPath $gradeNodeModules)) {
    $gradeNodeModules = Join-Path $PSScriptRoot '../../英語字幕/node_modules'
}
$env:NODE_PATH = $gradeNodeModules
Set-Location (Join-Path $PSScriptRoot '..')
& $NodeExecutable lib/sentence-grade-worker-supervisor.js
exit $LASTEXITCODE
