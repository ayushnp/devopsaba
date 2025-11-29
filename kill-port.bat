@echo off
echo Finding process using port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a
    echo Process %%a terminated.
)
echo Done!
pause

