$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$audit = Get-Content -LiteralPath (Join-Path $projectRoot 'data/conversation-game-audio.json') -Raw | ConvertFrom-Json
$questions = Get-Content -LiteralPath (Join-Path $projectRoot 'data/conversation-game-questions.json') -Raw | ConvertFrom-Json
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$voice.SelectVoice('Microsoft Zira Desktop')
$voice.Rate = 0
try {
  foreach ($question in $questions) {
    if ($audit.($question.id).mode -ne 'isolated') { continue }
    $outputDirectory = Join-Path $projectRoot ('tmp/game-isolated-audio/' + $question.id)
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
    $texts = @{ prompt = $question.question; reply = $question.options[$question.correct].en; response = $question.continuation }
    foreach ($part in @('prompt', 'reply', 'response')) {
      $voice.SetOutputToWaveFile((Join-Path $outputDirectory ($part + '.wav')))
      $voice.Speak($texts[$part])
      $voice.SetOutputToNull()
    }
    Write-Output ('Prepared isolated speech: ' + $question.id)
  }
} finally { $voice.Dispose() }
