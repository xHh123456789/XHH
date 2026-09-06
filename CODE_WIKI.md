# 地市工单管理系统 - Code Wiki

> 本文档为「地市工单管理系统」（宽带装维工单管理）的完整代码知识库，涵盖项目架构、模块职责、关键类与函数、依赖关系及运行方式。

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 项目整体架构](#3-项目整体架构)
- [4. 目录结构](#4-目录结构)
- [5. 后端模块详解（FastAPI + SQLAlchemy）](#5-后端模块详解fastapi--sqlalchemy)
  - [5.1 main.py — 应用入口与路由](#51-mainpy--应用入口与路由)
  - [5.2 database.py — 数据库配置](#52-databasepy--数据库配置)
  - [5.3 models.py — ORM 数据模型](#53-modelspy--orm-数据模型)
  - [5.4 schemas.py — Pydantic 数据校验](#54-schemaspy--pydantic-数据校验)
  - [5.5 crud.py — 数据访问层](#55-crudpy--数据访问层)
  - [5.6 auth.py — 认证与鉴权](#56-authpy--认证与鉴权)
  - [5.7 init_data.py — 数据初始化](#57-init_datapy--数据初始化)
- [6. 前端模块详解（Vue 3 + Vite）](#6-前端模块详解vue-3--vite)
  - [6.1 main.js / App.vue — 应用入口与布局](#61-mainjs--appvue--应用入口与布局)
  - [6.2 router/ — 路由与守卫](#62-router--路由与守卫)
  - [6.3 stores/ — Pinia 状态管理](#63-stores--pinia-状态管理)
  - [6.4 api/ — 接口请求层](#64-api--接口请求层)
  - [6.5 utils/ — 工具函数](#65-utils--工具函数)
  - [6.6 views/ — 页面视图](#66-views--页面视图)
  - [6.7 components/ — 通用组件](#67-components--通用组件)
  - [6.8 directives/ — 自定义指令](#68-directives--自定义指令)
  - [6.9 plugins/ — 全局插件](#69-plugins--全局插件)
- [7. 数据库设计](#7-数据库设计)
- [8. API 接口文档](#8-api-接口文档)
- [9. 依赖关系图](#9-依赖关系图)
- [10. 项目运行方式](#10-项目运行方式)
- [11. 部署与容器化](#11-部署与容器化)
- [12. 开发规范与工具链](#12-开发规范与工具链)

---

## 1. 项目概述

**地市工单管理系统** 是一个面向宽带装维业务的工单管理平台，用于管理客户、工程师与宽带安装/维护工单。

- **核心业务**：工单的创建、查询、更新、删除，以及工单状态流转（待处理 → 处理中 → 已完成）。
- **权限模型**：基于角色的访问控制（RBAC），区分 `admin` 与普通 `user`，普通用户可读/改工单状态，仅管理员可删除工单。
- **技术形态**：前后端分离的 Web 应用。后端为 Python FastAPI 服务，前端为 Vue 3 + Vite 单页应用，数据库使用 MySQL 8.0。

---

## 2. 技术栈

### 后端

| 类别 | 技术 | 版本 |
| --- | --- | --- |
| Web 框架 | FastAPI | 0.111.0 |
| ASGI 服务器 | Uvicorn | 0.30.1 |
| 生产 WSGI 服务器 | Gunicorn (UvicornWorker) | 26.0.0 |
| ORM | SQLAlchemy | 2.0.31 |
| 数据库驱动 | PyMySQL | 1.1.0 |
| 数据校验 | Pydantic | 2.13.4 |
| 密码哈希 | passlib[bcrypt] | 1.7.4（bcrypt 锁定 4.0.1） |
| JWT | python-jose[cryptography] | 3.5.0 |
| 环境变量 | python-dotenv | 1.0.0 |
| 数据库迁移 | Alembic | 1.18.5 |
| 数据库 | MySQL | 8.0 |

### 前端

| 类别 | 技术 | 版本 |
| --- | --- | --- |
| 框架 | Vue | ^3.5.40 |
| 构建工具 | Vite | ^8.2.0 |
| 路由 | Vue Router | ^4.6.4 |
| 状态管理 | Pinia | ^4.0.2 |
| UI 组件库 | Element Plus | ^2.14.3 |
| HTTP 客户端 | Axios | ^1.19.0 |
| 图表 | ECharts | ^6.1.0 |
| 代码规范 | ESLint + Prettier + Husky + commitlint | - |

> **依赖锁定说明**：`bcrypt` 被锁定在 `4.0.1`，因为 `bcrypt>=4.1` 与 `passlib 1.7.x` 不兼容（会抛出 `password cannot be longer than 72 bytes` 错误）。

---

## 3. 项目整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        浏览器 / 客户端                       │
│                 (Vue 3 SPA - http://localhost)              │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP (经 Nginx 反向代理 /api → :8000)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (前端静态资源 + 反向代理)            │
│            /        → /usr/share/nginx/html (Vue dist)      │
│            /api/*   → http://backend:8000/*                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI 后端 (:8000)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  路由层   │  │  认证层   │  │  校验层   │  │  异常处理 │   │
│  │ (main.py)│  │ (auth.py)│  │(schemas) │  │ (main.py)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────┐                    │
│  │       CRUD 数据访问层 (crud.py)      │                    │
│  └─────────────────┬───────────────────┘                    │
│                    │                                        │
│                    ▼                                        │
│  ┌─────────────────────────────────────┐                    │
│  │   ORM 模型层 (models.py / Base)     │                    │
│  └─────────────────┬───────────────────┘                    │
└────────────────────┼────────────────────────────────────────┘
                     │ SQLAlchemy + PyMySQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MySQL 8.0 数据库 (work_order_db)            │
│   customers │ engineers │ orders │ order_engineer │ users    │
└─────────────────────────────────────────────────────────────┘
```

**分层说明**：

1. **表现层（前端）**：Vue 3 SPA，通过 Axios 调用 REST API。
2. **网关层**：Nginx 负责静态资源分发与 API 反向代理。
3. **应用层（后端）**：FastAPI 处理 HTTP 请求，分为路由、认证、校验、CRUD、ORM 五层。
4. **数据层**：MySQL 存储业务数据，Alembic 管理 schema 迁移。

---

## 4. 目录结构

```
.
├── main.py                  # FastAPI 应用入口（路由、中间件、异常处理）
├── database.py              # 数据库连接、引擎、Session、环境变量
├── models.py                # SQLAlchemy ORM 模型（Customer/Engineer/Order/User）
├── schemas.py               # Pydantic 请求/响应 Schema
├── crud.py                  # 工单 CRUD 业务逻辑
├── auth.py                  # JWT 认证、密码哈希、权限依赖
├── init_data.py             # 数据库建表 + 测试数据初始化脚本
├── requirements.txt         # Python 依赖清单
├── gunicorn.conf.py         # Gunicorn 生产配置
├── alembic.ini              # Alembic 迁移配置
├── alembic/
│   ├── env.py               # 迁移环境（绑定 models.Base.metadata）
│   ├── script.py.mako       # 迁移文件模板
│   └── versions/
│       ├── 003c0410f70e_init_user_table.py        # 初始化 users 表
│       └── 4f28e84baacc_add_role_column_to_user.py # users 表新增 role 字段
├── Dockerfile               # 后端镜像构建
├── docker-compose.yml       # 一站式编排（MySQL + Backend + Frontend）
├── .env.example             # 环境变量示例
├── start.bat / start_all.bat# Windows 启动脚本
│
└── frontend/                # Vue 3 前端项目
    ├── src/
    │   ├── main.js          # 应用入口（注册 Pinia/ElementPlus/Router/插件/指令）
    │   ├── App.vue          # 根组件（侧边栏布局）
    │   ├── style.css        # 全局样式
    │   ├── api/             # API 请求模块（auth/order/stats/index）
    │   ├── router/          # 路由配置（含鉴权守卫）
    │   ├── stores/          # Pinia 状态（user store）
    │   ├── utils/           # 工具（axios 封装 request.js）
    │   ├── views/           # 页面视图（Login/Register/OrderList/Stats）
    │   ├── components/      # 通用组件（OrderForm/OrderList/BaseChart/...）
    │   ├── directives/      # 自定义指令（permission 权限指令）
    │   └── plugins/         # 全局插件（loading 加载状态）
    ├── vite.config.js       # Vite 配置（代理、代码分割）
    ├── nginx.conf           # 生产 Nginx 配置
    ├── Dockerfile           # 前端多阶段构建镜像
    ├── .env.development / .env.production / .env.test
    ├── eslint.config.js     # ESLint v9+ 扁平化配置
    ├── commitlint.config.js # Git 提交规范
    └── package.json
```

---

## 5. 后端模块详解（FastAPI + SQLAlchemy）

### 5.1 main.py — 应用入口与路由

**文件**：[main.py](file:///workspace/main.py)

**职责**：
- 创建 FastAPI 应用实例，配置 CORS、日志中间件、全局异常处理器。
- 定义全部 HTTP 路由（工单 CRUD、认证、统计）。

**关键组成**：

| 组成 | 说明 |
| --- | --- |
| `app = FastAPI(...)` | 应用实例，标题「地市工单管理系统 API」 |
| `CORSMiddleware` | 允许 `http://localhost:5173` 跨域（Vue 开发服务器） |
| `log_requests` 中间件 | 记录每个请求的方法、路径、耗时，并设置 `X-Process-Time` 响应头 |
| `http_exception_handler` | 统一 HTTP 异常响应格式 `{code, message, path}` |
| `validation_exception_handler` | 统一 422 参数校验异常 |
| `global_exception_handler` | 捕获未处理异常返回 500，记录 traceback |

**路由清单**：

| 方法 | 路径 | 认证 | 说明 |
| --- | --- | --- | --- |
| GET | `/ping` | 无 | 健康检查 |
| GET | `/orders` | ✅ 活跃用户 | 工单列表（支持 `status`、`skip`、`limit`） |
| GET | `/orders/{order_id}` | ✅ 活跃用户 | 单个工单详情 |
| POST | `/orders` | ✅ 活跃用户 | 创建工单 |
| PUT | `/orders/{order_id}` | ✅ 活跃用户 | 更新工单 |
| DELETE | `/orders/{order_id}` | ✅ 管理员 | 删除工单 |
| GET | `/stats` | 无 | 工单统计（总数/各状态数） |
| GET | `/stats/daily` | 无 | 近 7 天每日工单创建数量 |
| POST | `/register` | 无 | 用户注册 |
| POST | `/token` | 无 | 用户登录（OAuth2 表单，返回 JWT） |
| GET | `/users/me` | ✅ 活跃用户 | 当前用户信息 |
| GET | `/protected` | ✅ 活跃用户 | 受保护路由测试 |

> **响应组装模式**：工单接口未直接使用 `response_model` 序列化 ORM 对象，而是在路由函数中手动拼装 `{order_id, address, status, created_at, customer_name, engineers}` 字典，以展开关联的客户姓名和工程师姓名列表。

---

### 5.2 database.py — 数据库配置

**文件**：[database.py](file:///workspace/database.py)

**职责**：
- 根据 `ENV` 环境变量加载对应 `.env.*` 文件（development / production / test）。
- 构造数据库连接串并创建 SQLAlchemy `engine`、`SessionLocal`、`Base`。
- 提供 `get_db()` 依赖注入函数。

**关键变量**：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ENV` | `development` | 决定加载的 .env 文件 |
| `DATABASE_URL` | `mysql+pymysql://root:@localhost:3306/work_order_db?charset=utf8mb4` | 数据库连接串 |
| `SECRET_KEY` | `your-secret-key-change-in-production` | JWT 签名密钥 |
| `ALGORITHM` | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token 过期时间（分钟） |

**关键函数**：

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

`get_db` 是 FastAPI 依赖注入的数据库会话提供者，使用生成器确保请求结束后关闭 Session。

---

### 5.3 models.py — ORM 数据模型

**文件**：[models.py](file:///workspace/models.py)

定义 4 张业务表 + 1 张多对多中间表：

#### 中间表 `order_engineer`
工单与工程师的多对多关联表，含 `order_id`、`engineer_id` 联合主键。

#### `Customer`（客户表）
| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | Integer | PK, autoincrement | |
| name | String(50) | NOT NULL, UNIQUE | 客户姓名 |
| phone | String(20) | | 手机号 |
| created_at | DateTime | server_default=now() | 创建时间 |

关系：`orders` 一对多 → `Order`。

#### `Engineer`（工程师表）
| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | Integer | PK | |
| name | String(50) | NOT NULL | 工程师姓名 |
| phone | String(20) | | 手机号 |
| skill | String(50) | | 擅长技能 |
| created_at | DateTime | server_default=now() | |

关系：`orders` 多对多 → `Order`（通过 `order_engineer`）。

#### `Order`（工单表）
| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | Integer | PK | |
| order_id | String(20) | NOT NULL, UNIQUE | 工单编号（业务主键） |
| address | String(200) | NOT NULL | 安装地址 |
| status | String(20) | default=待处理 | 工单状态 |
| created_at | DateTime | server_default=now() | |
| customer_id | Integer | FK→customers.id, NOT NULL | 所属客户 |

关系：
- `customer` 多对一 → `Customer`
- `engineers` 多对多 → `Engineer`

#### `User`（用户表）
| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | Integer | PK | |
| username | String(50) | NOT NULL, UNIQUE | 用户名 |
| password_hash | String(255) | NOT NULL | bcrypt 密码哈希 |
| email | String(100) | | 邮箱 |
| is_active | Integer | default=1 | 是否激活 |
| role | String(20) | default=user | 角色：`user` / `admin` |
| created_at | DateTime | server_default=now() | |

---

### 5.4 schemas.py — Pydantic 数据校验

**文件**：[schemas.py](file:///workspace/schemas.py)

#### 请求 Schema

| 类 | 字段 | 说明 |
| --- | --- | --- |
| `OrderCreate` | order_id, address, customer_name, status(默认待处理), engineer_names(可选列表) | 创建工单 |
| `OrderUpdate` | address?, status?, customer_name? | 更新工单（全部可选） |
| `UserCreate` | username, password, email? | 注册请求 |
| `UserLogin` | username, password | 登录请求 |

#### 响应 Schema

| 类 | 字段 | 说明 |
| --- | --- | --- |
| `OrderResponse` | order_id, address, status, created_at, customer_name, engineers[] | 工单响应 |
| `CustomerResponse` | id, name, phone, created_at | 客户响应 |
| `EngineerResponse` | id, name, phone, skill, created_at | 工程师响应 |
| `UserResponse` | id, username, email, is_active, created_at | 用户响应 |
| `Token` | access_token, token_type, role | 登录令牌响应 |
| `TokenData` | username? | JWT 内部载荷 |

> 响应 Schema 均配置 `Config.from_attributes = True`，支持从 SQLAlchemy ORM 对象自动转换。

---

### 5.5 crud.py — 数据访问层

**文件**：[crud.py](file:///workspace/crud.py)

封装工单的全部数据库操作，与路由层解耦。

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `get_order` | `(db, order_id) -> Optional[Order]` | 按工单号查询单个工单 |
| `get_orders` | `(db, status?, skip=0, limit=100) -> List[Order]` | 工单列表（状态过滤+分页） |
| `create_order` | `(db, order_data: OrderCreate) -> Order` | 创建工单：自动查找/创建客户，关联已有工程师 |
| `update_order` | `(db, order_id, order_data: OrderUpdate) -> Optional[Order]` | 部分更新；状态值校验（待处理/处理中/已完成），非法值抛 `ValueError` |
| `delete_order` | `(db, order_id) -> bool` | 删除工单，返回是否成功 |
| `get_order_stats` | `(db) -> dict` | 统计总数及各状态数量 |

**`create_order` 核心逻辑**：
1. 按客户姓名查找 `Customer`，不存在则新建。
2. 创建 `Order` 并关联 `customer_id`。
3. 遍历 `engineer_names`，仅关联数据库中已存在的工程师（不存在则忽略）。
4. `commit` 并 `refresh` 返回完整对象。

---

### 5.6 auth.py — 认证与鉴权

**文件**：[auth.py](file:///workspace/auth.py)

#### 密码相关
- `pwd_context = CryptContext(schemes=["bcrypt"])` — bcrypt 加密上下文。
- `verify_password(plain, hashed)` — 校验明文密码与哈希。
- `get_password_hash(password)` — 生成密码哈希。

#### 用户相关
- `get_user_by_username(db, username)` — 按用户名查用户。
- `authenticate_user(db, username, password)` — 验证身份，失败返回 `False`。

#### JWT 相关
- `create_access_token(data, expires_delta?)` — 签发 JWT，`sub` 字段存用户名，默认有效期来自 `ACCESS_TOKEN_EXPIRE_MINUTES`。
- `get_current_user(token, db)` — **依赖注入**：解码 JWT、查库返回 `User`，失败抛 401。
- `get_current_active_user(current_user)` — **依赖注入**：在 `get_current_user` 基础上校验 `is_active == 1`，否则 400。
- `get_current_admin_user(current_user)` — **依赖注入**：在 `get_current_user` 基础上校验 `role == "admin"`，否则 403。用于删除工单等管理员专属操作。

**认证链路**：`OAuth2PasswordBearer(tokenUrl="token")` → `get_current_user` → `get_current_active_user` / `get_current_admin_user`。

---

### 5.7 init_data.py — 数据初始化

**文件**：[init_data.py](file:///workspace/init_data.py)

**职责**：开发环境一键建表并写入测试数据。

- `init_database()`：
  1. `Base.metadata.create_all(engine)` 创建全部表。
  2. 若 `customers` 表已有数据则跳过。
  3. 插入 4 个客户、4 个工程师、5 个工单，并建立工单-工程师多对多关联。

运行：`python init_data.py`

---

## 6. 前端模块详解（Vue 3 + Vite）

### 6.1 main.js / App.vue — 应用入口与布局

**文件**：[main.js](file:///workspace/frontend/src/main.js) / [App.vue](file:///workspace/frontend/src/App.vue)

`main.js` 注册顺序：
1. `createApp(App)`
2. `createPinia()` — 状态管理
3. `ElementPlus`（中文 locale `zhCn`）
4. `router`
5. `loadingPlugin` — 全局加载插件
6. 全局指令 `v-permission`

`App.vue` 提供整体布局：
- 左侧 `el-aside` 侧边栏：系统标题、当前用户名、导航菜单（工单列表 / 数据统计 / 退出登录）。
- 右侧 `el-main` 主区域：`<router-view />` 渲染子页面。

---

### 6.2 router/ — 路由与守卫

**文件**：[router/index.js](file:///workspace/frontend/src/router/index.js)

| 路径 | 组件 | requiresAuth | 说明 |
| --- | --- | --- | --- |
| `/login` | Login | false | 登录页 |
| `/register` | Register | false | 注册页 |
| `/` | → redirect `/orders` | - | 根路径重定向 |
| `/orders` | OrderList | true | 工单列表 |
| `/stats` | Stats | true | 数据统计 |

- 所有页面组件采用**动态导入**（懒加载）优化首屏。
- **全局前置守卫** `router.beforeEach`：若目标路由 `meta.requiresAuth` 为 true 且 `userStore.isLoggedIn` 为 false，则重定向至 `/login`。

---

### 6.3 stores/ — Pinia 状态管理

**文件**：[stores/user.js](file:///workspace/frontend/src/stores/user.js)

`useUserStore`（组合式 API 风格）：

**State**：
- `token` / `username` / `role` — 从 `localStorage` 初始化，持久化登录态。

**Getters**：
- `isLoggedIn` — `!!token`
- `isAdmin` — `role === 'admin'`

**Actions**：
- `login(username, password)` — 调用 `loginApi`，成功后写入 state + localStorage，返回布尔。
- `register(userData)` — 调用 `registerApi`。
- `logout()` — 清空 state 与 localStorage。

---

### 6.4 api/ — 接口请求层

**文件**：[api/index.js](file:///workspace/frontend/src/api/index.js)

统一出口，按领域拆分：

| 模块 | 文件 | 函数 |
| --- | --- | --- |
| 认证 | `auth.js` | `login`、`register`、`getCurrentUser` |
| 工单 | `order.js` | `getOrders`、`getOrder`、`createOrder`、`updateOrder`、`deleteOrder` |
| 统计 | `stats.js` | `getStats`、`getDailyStats` |

> `login` 使用 `multipart/form-data` 提交（适配后端 `OAuth2PasswordRequestForm`），其余接口使用 JSON。

---

### 6.5 utils/ — 工具函数

**文件**：[utils/request.js](file:///workspace/frontend/src/utils/request.js)

Axios 实例封装：

- `baseURL` 取自 `import.meta.env.VITE_API_BASE_URL`（默认 `/api`）。
- 超时 10 秒。
- **请求拦截器**：自动从 `useUserStore()` 读取 token 并注入 `Authorization: Bearer <token>`。
- **响应拦截器**：成功时直接返回 `response.data`（免去 `.data` 嵌套）；失败时用 `ElMessage.error` 弹出错误信息。

---

### 6.6 views/ — 页面视图

| 视图 | 文件 | 说明 |
| --- | --- | --- |
| Login | [Login.vue](file:///workspace/frontend/src/views/Login.vue) | 用户名+密码登录，成功跳 `/` |
| Register | [Register.vue](file:///workspace/frontend/src/views/Register.vue) | 注册表单（用户名/密码必填，邮箱选填） |
| OrderList | [OrderList.vue](file:///workspace/frontend/src/views/OrderList.vue) | 工单列表页：表格展示、状态下拉切换、新增弹窗、删除（`v-permission="'admin'"`） |
| Stats | [Stats.vue](file:///workspace/frontend/src/views/Stats.vue) | 统计卡片 + 饼图（状态分布）+ 折线图（近 7 天趋势） |

> `Stats.vue` 直接使用 `axios.get('/api/stats')` 而非封装的 `request`，并在失败时使用模拟数据兜底（开发友好）。

---

### 6.7 components/ — 通用组件

| 组件 | 文件 | 说明 |
| --- | --- | --- |
| OrderForm | [OrderForm.vue](file:///workspace/frontend/src/components/OrderForm.vue) | 新建工单表单，提交成功后 `emit('success')` 通知父组件 |
| OrderList | [OrderList.vue](file:///workspace/frontend/src/components/OrderList.vue) | 工单表格组件（含状态切换、删除），通过 `defineExpose({ fetchOrders })` 暴露刷新方法 |
| BaseChart | [BaseChart.vue](file:///workspace/frontend/src/components/BaseChart.vue) | ECharts 封装：接收 `option` 与 `height`，支持响应式 `resize`、option 深度监听、卸载时 `dispose` |
| ConfirmDialog | [ConfirmDialog.vue](file:///workspace/frontend/src/components/ConfirmDialog.vue) | 通用确认弹窗（`v-model` + `confirm`/`cancel` 事件） |
| EmptyState | [EmptyState.vue](file:///workspace/frontend/src/components/EmptyState.vue) | 空状态占位 |

---

### 6.8 directives/ — 自定义指令

**文件**：[directives/permission.js](file:///workspace/frontend/src/directives/permission.js)

`v-permission="'admin'"` 指令：
- `mounted` 与 `updated` 钩子中比对 `userStore.role` 与指令值，不匹配则从 DOM 移除该元素。
- 实现前端层面的按钮级权限控制（后端亦有权限校验，双重保障）。

---

### 6.9 plugins/ — 全局插件

**文件**：[plugins/loading.js](file:///workspace/frontend/src/plugins/loading.js)

全局加载状态插件：
- 维护 `isLoading` ref 与 `loadingCount` 计数器（支持并发请求计数）。
- 注入 `app.config.globalProperties.$loading = { show, hide, isLoading }`。
- 同时通过 `app.provide('loading', ...)` 支持组合式 API 访问。

---

## 7. 数据库设计

### ER 关系

```
customers 1───< orders >───< order_engineer >───< engineers
              (customer_id)                       (engineer_id)

users  (独立表，用于系统登录)
```

### 表清单

| 表名 | 说明 | 关键关系 |
| --- | --- | --- |
| `customers` | 客户 | 一对多 orders |
| `engineers` | 工程师 | 多对多 orders |
| `orders` | 工单 | 多对一 customers；多对多 engineers |
| `order_engineer` | 工单-工程师中间表 | 联合主键 |
| `users` | 系统用户 | 独立 |

### 工单状态枚举

```
待处理 → 处理中 → 已完成
```

状态值在 `crud.update_order` 中硬编码校验。

### 迁移记录（Alembic）

| Revision | 说明 |
| --- | --- |
| `003c0410f70e` (init) | 创建 `users` 表 |
| `4f28e84baacc` | `users` 表新增 `role` 字段 |

> 注：`customers`/`engineers`/`orders` 表由 `init_data.py` 中 `Base.metadata.create_all` 直接创建，未纳入 Alembic 迁移版本管理。

---

## 8. API 接口文档

### 认证

#### POST `/token` — 登录
- **Content-Type**：`multipart/form-data`
- **字段**：`username`, `password`
- **响应**：`{ access_token, token_type: "bearer", role }`
- **错误**：401 用户名或密码错误

#### POST `/register` — 注册
- **Body**：`{ username, password, email? }`
- **响应**：`UserResponse`
- **错误**：400 用户名已存在

### 工单（需 `Authorization: Bearer <token>`）

| 方法 | 路径 | 权限 | 描述 |
| --- | --- | --- | --- |
| GET | `/orders?status=&skip=&limit=` | 活跃用户 | 列表 |
| GET | `/orders/{order_id}` | 活跃用户 | 详情 |
| POST | `/orders` | 活跃用户 | 创建 |
| PUT | `/orders/{order_id}` | 活跃用户 | 更新 |
| DELETE | `/orders/{order_id}` | 管理员 | 删除 |

**OrderResponse 示例**：
```json
{
  "order_id": "T100",
  "address": "达州市通川区朝阳路1号",
  "status": "待处理",
  "created_at": "2026-08-11T10:00:00",
  "customer_name": "张三",
  "engineers": ["张工", "李工"]
}
```

### 统计

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/stats` | `{ total, pending, processing, completed }` |
| GET | `/stats/daily` | `[{ date: "MM-DD", count }]` 近 7 天 |

### 用户

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/users/me` | 当前登录用户信息 |
| GET | `/ping` | 健康检查 |

---

## 9. 依赖关系图

### 后端模块依赖

```
main.py ──┬──> crud.py ──> models.py ──> database.py (Base)
          ├──> auth.py ──┬──> database.py (SECRET_KEY/ALGORITHM/get_db)
          │               ├──> models.py (User)
          │               └──> schemas.py (TokenData)
          ├──> schemas.py
          └──> models.py

auth.py ──> database.py, models.py, schemas.py
crud.py ──> models.py, schemas.py
models.py ──> database.py (Base)
init_data.py ──> database.py, models.py
alembic/env.py ──> models.py (Base.metadata)
```

**核心依赖方向**：`main → crud/auth → models → database`，`schemas` 独立定义被 `main/crud/auth` 引用。

### 前端模块依赖

```
main.js ──> App.vue, router, stores/user, ElementPlus, plugins/loading, directives/permission

App.vue ──> stores/user, vue-router

router/index.js ──> stores/user (守卫), views/* (懒加载)

stores/user.js ──> api/auth, element-plus

api/* ──> utils/request

utils/request.js ──> axios, stores/user, element-plus

views/* ──> api/*, components/*, stores/user, element-plus

components/* ──> api/* (OrderForm/OrderList), echarts (BaseChart)
```

---

## 10. 项目运行方式

### 10.1 前置要求

- Python 3.10+
- Node.js 22+（前端工具链 ESLint 10 / Vite 8 / commitlint 21 要求）
- MySQL 8.0

### 10.2 后端启动

```bash
# 1. 创建虚拟环境并安装依赖
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env.development  # 编辑数据库连接等

# 3. 初始化数据库（建表 + 测试数据）
python init_data.py

# 4. 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API 文档：`http://localhost:8000/docs`（Swagger UI）
- Windows 一键启动：`start.bat`

### 10.3 前端启动

```bash
cd frontend
npm install
npm run dev          # 开发服务器 http://localhost:5173
```

Vite 已配置 `/api` 代理到 `http://localhost:8000`，开发时无需处理跨域。

### 10.4 数据库迁移（Alembic）

```bash
# 生成迁移
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

---

## 11. 部署与容器化

### 11.1 Docker Compose 一键部署

```bash
docker compose up -d --build
```

编排 3 个服务：

| 服务 | 镜像/构建 | 端口 | 说明 |
| --- | --- | --- | --- |
| `mysql` | `mysql:8.0` | 3307→3306 | 数据库，数据卷 `mysql_data` 持久化 |
| `backend` | `./Dockerfile` (Python 3.10-slim) | 8000 | FastAPI，依赖 mysql healthy |
| `frontend` | `./frontend/Dockerfile` (Node 22 + nginx) | 80 | Vue 静态资源 + API 反代 |

### 11.2 后端 Dockerfile

- 基础镜像 `python:3.10-slim`
- 先复制 `requirements.txt` 安装依赖（利用 Docker 层缓存），再复制源码
- 启动命令：`uvicorn main:app --host 0.0.0.0 --port 8000`

### 11.3 前端 Dockerfile（多阶段构建）

- **阶段 1 (builder)**：`node:22-alpine`，`npm install`（国内 npmmirror 源）+ `npm run build`
- **阶段 2 (runtime)**：`nginx:alpine`，仅复制 `dist/` 与 `nginx.conf`，镜像体积小

### 11.4 Nginx 配置（nginx.conf）

- `/` → 静态文件，`try_files` 支持 SPA 路由回退到 `index.html`
- `/api/` → 反向代理到 `http://backend:8000/`（剥离 `/api` 前缀），设置转发头

### 11.5 生产服务器（Gunicorn）

```bash
gunicorn -c gunicorn.conf.py main:app
```

`gunicorn.conf.py` 配置：
- `workers = cpu_count * 2 + 1`
- `worker_class = "uvicorn.workers.UvicornWorker"`
- 访问日志 `logs/access.log`，错误日志 `logs/error.log`

---

## 12. 开发规范与工具链

### 12.1 前端代码规范

- **ESLint v10**（扁平化配置 `eslint.config.js`）：`js.configs.recommended` + `vue/flat/recommended`，生产环境禁用 `console`/`debugger`。
- **Prettier**：统一代码格式，与 ESLint 通过 `@vue/eslint-config-prettier` 协同。
- **Husky**：Git hooks（`pre-commit`、`commit-msg`）。
- **lint-staged**：提交前对暂存文件执行 `prettier --write` + `eslint --fix`。
- **commitlint**：强制 Conventional Commits 提交规范。

### 12.2 构建优化（vite.config.js）

- 路径别名 `@` → `src`
- 手动代码分割 `manualChunks`：`element-ui`、`chart-vendor`、`utils-vendor`、`vue-vendor` 独立分包
- 压缩使用 `terser`，不生成 sourcemap

### 12.3 环境变量

| 文件 | 用途 |
| --- | --- |
| `.env.development` | 开发环境（`VITE_API_BASE_URL=/api`） |
| `.env.production` | 生产环境 |
| `.env.test` | 测试环境 |

---

## 附录：关键设计决策

1. **工单响应手动组装**：因需展开关联的客户姓名与工程师姓名列表，路由层未直接使用 `response_model` 序列化 ORM 对象，而是手动构造 dict。
2. **工程师关联策略**：创建工单时，若指定的工程师姓名不存在于数据库中则**忽略**，不自动创建（`crud.create_order`）。
3. **状态值硬编码校验**：工单状态枚举（待处理/处理中/已完成）在 `crud.update_order` 中硬编码，未抽离为常量或枚举类。
4. **前端权限双重控制**：删除按钮通过 `v-permission="'admin'"` 前端隐藏，后端接口同时校验 `get_current_admin_user`，防止越权调用。
5. **Token 持久化**：前端将 token/username/role 存入 `localStorage`，刷新页面保持登录态。
6. **bcrypt 版本锁定**：因 passlib 1.7.x 兼容性，bcrypt 锁定在 4.0.1。
