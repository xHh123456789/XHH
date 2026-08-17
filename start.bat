@echo off
echo 正在启动服务...
uvicorn main:app --host 0.0.0.0 --port 8000
pause