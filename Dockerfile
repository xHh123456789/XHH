# 1. 指定基础镜像（Python 3.10 轻量版）
FROM python:3.10-slim

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 将依赖文件复制到容器内（利用 Docker 的缓存机制）
COPY requirements.txt .

# 4. 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 5. 将项目代码复制到容器内
COPY . .

# 6. 暴露应用运行的端口
EXPOSE 8000

# 7. 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]