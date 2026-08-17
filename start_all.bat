@echo off
:: ✅ 关键修复：将命令行编码设置为 UTF-8，解决中文乱码问题
chcp 65001 > nul

title 工单管理系统-一键启动脚本
cls

:: ============================================================
:: 1. 配置路径 (如果以后路径变了，直接修改这里)
:: ============================================================
set MYSQL_SERVICE_NAME=mysql
set NGINX_PATH=D:\software\nginx-1.31.3\nginx-1.31.3
set PROJECT_PATH=D:\workspace\Python\study\pythonStudy
set VENV_PATH=%PROJECT_PATH%\venv\Scripts\activate.bat

echo [1/3] 正在启动 MySQL 服务...
net start %MYSQL_SERVICE_NAME%
if %errorlevel% equ 0 (
    echo ✅ MySQL 已启动。
) else (
    echo ⚠️ MySQL 可能已经运行中或服务名不正确，请检查。
)

echo.
echo [2/3] 正在启动 Nginx 服务器...
cd /d %NGINX_PATH%
start nginx
echo ✅ Nginx 已在后台启动。

echo.
echo [3/3] 正在启动 FastAPI 后端服务...
cd /d %PROJECT_PATH%

:: 检查是否存在虚拟环境，如果有则激活
if exist "%VENV_PATH%" (
    echo 📦 检测到虚拟环境，正在激活...
    call %VENV_PATH%
)

:: 使用 start 命令在新窗口打开后端，这样你可以看到日志且不会阻塞脚本
start "FastAPI-Backend" cmd /k "chcp 65001 > nul && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo ✅ 后端服务已在独立窗口启动。

echo.
echo ============================================================
echo 🎉 所有服务已尝试启动！
echo 现在你可以访问: http://localhost
echo ============================================================
pause