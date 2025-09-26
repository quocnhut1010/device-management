@echo off
echo Running backend cleanup script...
powershell -ExecutionPolicy Bypass -File "%~dp0cleanup-build.ps1"
pause