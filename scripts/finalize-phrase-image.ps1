param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Out,
  [Parameter(Mandatory = $true)][string]$Text
)

$ErrorActionPreference = "Stop"

$candidates = @(
  "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe",
  "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
  "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
)

$python = $null
foreach ($candidate in $candidates) {
  if ($candidate -and (Test-Path -LiteralPath $candidate)) {
    $python = $candidate
    break
  }
}

if (-not $python) {
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) {
    $python = $cmd.Source
  }
}

if (-not $python) {
  throw "No Python executable found. Expected bundled Codex Python under .cache/codex-runtimes."
}

$script = Join-Path $PSScriptRoot "finalize-phrase-image.py"
& $python $script --src $Src --out $Out --text $Text

if (-not (Test-Path -LiteralPath $Out)) {
  throw "Final image was not written: $Out"
}
