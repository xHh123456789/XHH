# 阶段1：构建阶段（项目工具链 eslint10/vite8/commitlint21 要求 Node >= 22）
FROM node:22-alpine AS builder

WORKDIR /app

# 复制依赖文件并安装（国内镜像源加速）
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码并构建
COPY . .
RUN npm run build

# 阶段2：运行阶段（轻量 nginx）
FROM nginx:alpine

# 只复制构建产物（不包含 Node.js，镜像更小）
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
