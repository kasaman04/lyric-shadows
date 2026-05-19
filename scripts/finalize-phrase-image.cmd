@echo off
setlocal

set "PY=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if not exist "%PY%" (
  set "PY=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
)

if not exist "%PY%" (
  set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
)

if not exist "%PY%" (
  for %%P in (python.exe) do set "PY=%%~$PATH:P"
)

if not exist "%PY%" (
  echo No Python executable found. Expected bundled Codex Python under .cache\codex-runtimes. 1>&2
  exit /b 1
)

"%PY%" "%~dp0finalize-phrase-image.py" %*
if errorlevel 1 exit /b %errorlevel%
