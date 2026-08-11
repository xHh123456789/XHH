import time
import logging
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Request,status

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session

from database import get_db
import crud
import schemas

# main.py 中添加新的导入
from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_user, get_current_active_user
)
from schemas import UserCreate, UserResponse, Token
from models import User
from fastapi.security import OAuth2PasswordBearer

from auth import get_current_admin_user

# ========== 配置日志 ==========
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== 创建 FastAPI 应用 ==========
app = FastAPI(
    title="地市工单管理系统 API",
    version="1.0.0",
    description="用于管理宽带装维工单的后端服务"
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# ========== CORS 跨域配置 ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vue 开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 日志中间件 ==========
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录每个请求的方法、路径和耗时"""
    start_time = time.time()
    logger.info(f"📥 收到请求: {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"📤 请求完成: {request.method} {request.url.path} - {response.status_code} - 耗时 {process_time:.3f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response


# ========== 全局异常处理器 ==========

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """处理 HTTP 异常（404, 400 等）"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail,
            "path": request.url.path
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """处理请求参数校验异常（422）"""
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "请求参数校验失败",
            "detail": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """处理所有未捕获的异常（500）"""
    import traceback
    error_detail = traceback.format_exc()
    logger.error(f"❌ 未捕获异常: {error_detail}")
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": "服务器内部错误，请联系管理员",
            # "detail": error_detail  # 开发环境可开启
        }
    )


# ========== 健康检查 ==========

@app.get("/ping")
def ping():
    """服务健康检查"""
    return {"status": "ok", "message": "服务运行正常"}


# ========== 工单接口 ==========

# 修改 list_orders，添加 current_user 依赖
@app.get("/orders", response_model=list[schemas.OrderResponse])
def list_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # 新增认证
):
    """获取工单列表（支持状态过滤和分页）"""
    orders = crud.get_orders(db, status=status, skip=skip, limit=limit)
    result = []
    for o in orders:
        result.append({
            "order_id": o.order_id,
            "address": o.address,
            "status": o.status,
            "created_at": o.created_at,
            "customer_name": o.customer.name if o.customer else None,
            "engineers": [e.name for e in o.engineers]
        })
    return result


@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ 添加认证
):
    """根据工单号获取单个工单详情"""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"工单 {order_id} 不存在")
    return {
        "order_id": order.order_id,
        "address": order.address,
        "status": order.status,
        "created_at": order.created_at,
        "customer_name": order.customer.name if order.customer else None,
        "engineers": [e.name for e in order.engineers]
    }


@app.post("/orders", response_model=schemas.OrderResponse, status_code=201)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ 添加认证
):
    """创建新工单"""
    # 检查工单号是否已存在
    existing = crud.get_order(db, order_data.order_id)
    if existing:
        raise HTTPException(status_code=400, detail=f"工单号 {order_data.order_id} 已存在")

    new_order = crud.create_order(db, order_data)
    return {
        "order_id": new_order.order_id,
        "address": new_order.address,
        "status": new_order.status,
        "created_at": new_order.created_at,
        "customer_name": new_order.customer.name if new_order.customer else None,
        "engineers": [e.name for e in new_order.engineers]
    }


@app.put("/orders/{order_id}", response_model=schemas.OrderResponse)
def update_order(
    order_id: str,
    order_data: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ 添加认证
):
    """更新工单信息"""
    try:
        order = crud.update_order(db, order_id, order_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not order:
        raise HTTPException(status_code=404, detail=f"工单 {order_id} 不存在")

    return {
        "order_id": order.order_id,
        "address": order.address,
        "status": order.status,
        "created_at": order.created_at,
        "customer_name": order.customer.name if order.customer else None,
        "engineers": [e.name for e in order.engineers]
    }


@app.delete("/orders/{order_id}")
def delete_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ 只允许管理员删除
):
    """删除工单"""
    success = crud.delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"工单 {order_id} 不存在")
    return {"message": f"工单 {order_id} 已删除"}


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """获取工单统计信息"""
    return crud.get_order_stats(db)


# ========== 用户注册 ==========

@app.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 创建新用户
    new_user = User(
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        email=user_data.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ========== 用户登录 ==========

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录，获取 Token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


# ========== 测试认证接口 ==========

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """获取当前登录用户信息（需要认证）"""
    return current_user


@app.get("/protected")
async def protected_route(current_user: User = Depends(get_current_active_user)):
    """测试受保护的路由"""
    return {"message": f"你好，{current_user.username}！你有权限访问此接口。"}