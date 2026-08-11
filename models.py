from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, func
from sqlalchemy.orm import relationship
from database import Base

# ========== 多对多关联表（中间表） ==========
order_engineer_association = Table(
    "order_engineer",
    Base.metadata,
    Column("order_id", Integer, ForeignKey("orders.id"), primary_key=True),
    Column("engineer_id", Integer, ForeignKey("engineers.id"), primary_key=True),
)

# ========== 客户模型 ==========
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True, comment="客户姓名")
    phone = Column(String(20), comment="手机号")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")

    # 一对多关系：一个客户有多个工单
    orders = relationship("Order", back_populates="customer")

    def __repr__(self):
        return f"<Customer(id={self.id}, name='{self.name}')>"


# ========== 工程师模型 ==========
class Engineer(Base):
    __tablename__ = "engineers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, comment="工程师姓名")
    phone = Column(String(20), comment="手机号")
    skill = Column(String(50), comment="擅长技能")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")

    # 多对多关系：一个工程师处理多个工单
    orders = relationship("Order", secondary=order_engineer_association, back_populates="engineers")

    def __repr__(self):
        return f"<Engineer(id={self.id}, name='{self.name}')>"


# ========== 工单模型 ==========
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(20), nullable=False, unique=True, comment="工单编号")
    address = Column(String(200), nullable=False, comment="安装地址")
    status = Column(String(20), default="待处理", comment="工单状态")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")

    # 外键：关联客户
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, comment="客户ID")
    customer = relationship("Customer", back_populates="orders")

    # 多对多关系：一个工单分配给多个工程师
    engineers = relationship("Engineer", secondary=order_engineer_association, back_populates="orders")

    def __repr__(self):
        return f"<Order(id={self.id}, order_id='{self.order_id}', status='{self.status}')>"

# ✅ ========== 用户模型 ==========
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True, comment="用户名")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")
    email = Column(String(100), comment="邮箱")
    is_active = Column(Integer, default=1, comment="是否激活")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"