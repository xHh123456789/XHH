from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ========== 请求体 Schema ==========

class OrderCreate(BaseModel):
    """创建工单时前端需要传的数据"""
    order_id: str
    address: str
    customer_name: str
    status: Optional[str] = "待处理"
    engineer_names: Optional[List[str]] = []  # 可选的工程师列表


class OrderUpdate(BaseModel):
    """更新工单时前端需要传的数据（全部可选）"""
    address: Optional[str] = None
    status: Optional[str] = None
    customer_name: Optional[str] = None


# ========== 响应 Schema（返回给前端的数据结构） ==========

class OrderResponse(BaseModel):
    """查询工单时返回的数据结构"""
    order_id: str
    address: str
    status: str
    created_at: datetime
    customer_name: str
    engineers: List[str] = []

    class Config:
        from_attributes = True  # 支持从 ORM 对象自动转换


class CustomerResponse(BaseModel):
    """客户信息响应"""
    id: int
    name: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EngineerResponse(BaseModel):
    """工程师信息响应"""
    id: int
    name: str
    phone: Optional[str] = None
    skill: Optional[str] = None
    created_at: datetime





# ====== 用户认证相关 ======

class UserCreate(BaseModel):
    """用户注册请求体"""
    username: str
    password: str
    email: Optional[str] = None

class UserLogin(BaseModel):
    """用户登录请求体"""
    username: str
    password: str

class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: str
    email: Optional[str] = None
    is_active: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str
    role: Optional[str] = "user"

class TokenData(BaseModel):
    """Token 内部数据"""
    username: Optional[str] = None