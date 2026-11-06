$ErrorActionPreference = 'Stop'
$gradeRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$gradeNode = (Get-Command node.exe).Source
$gradeUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
if (-not (Test-Path -LiteralPath (Join-Path $gradeRoot '.env.pet-worker'))) {
    throw 'Missing .env.pet-worker configuration.'
}
$gradePowerShell = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
$gradeStartScript = Join-Path $gradeRoot 'scripts/start-sentence-grade-worker.ps1'
$gradeAction = New-ScheduledTaskAction -Execute $gradePowerShell -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $gradeStartScript + '" -NodeExecutable "' + $gradeNode + '"') -WorkingDirectory $gradeRoot
$gradeTrigger = New-ScheduledTaskTrigger -AtLogOn -User $gradeUser
$gradeRecovery = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 1)
$gradePrincipal = New-ScheduledTaskPrincipal -UserId $gradeUser -LogonType Interactive -RunLevel Limited
$gradeSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'LyricShadowsSentenceGrader' -Description 'Grade English practice answers through the local Codex app-server and reconnect after failures.' -Action $gradeAction -Trigger @($gradeTrigger,$gradeRecovery) -Principal $gradePrincipal -Settings $gradeSettings -Force | Out-Null
Start-ScheduledTask -TaskName 'LyricShadowsSentenceGrader'
Get-ScheduledTask -TaskName 'LyricShadowsSentenceGrader' | Select-Object TaskName,State
