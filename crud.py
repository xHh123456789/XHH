from sqlalchemy.orm import Session
from typing import Optional, List
from models import Order, Customer, Engineer
from schemas import OrderCreate, OrderUpdate


# ========== 工单查询 ==========

def get_order(db: Session, order_id: str) -> Optional[Order]:
    """根据工单号查询单个工单"""
    return db.query(Order).filter(Order.order_id == order_id).first()


def get_orders(
    db: Session,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Order]:
    """查询工单列表（支持状态过滤和分页）"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.offset(skip).limit(limit).all()


# ========== 工单创建 ==========

def create_order(db: Session, order_data: OrderCreate) -> Order:
    """创建工单（自动处理客户和工程师关联）"""
    # 1. 处理客户：查找或创建
    customer = db.query(Customer).filter(Customer.name == order_data.customer_name).first()
    if not customer:
        customer = Customer(name=order_data.customer_name)
        db.add(customer)
        db.flush()  # 获取 ID

    # 2. 创建工单
    new_order = Order(
        order_id=order_data.order_id,
        address=order_data.address,
        status=order_data.status,
        customer_id=customer.id
    )
    db.add(new_order)
    db.flush()  # 获取 ID

    # 3. 处理工程师关联（多对多）
    for eng_name in order_data.engineer_names:
        engineer = db.query(Engineer).filter(Engineer.name == eng_name).first()
        if engineer:
            new_order.engineers.append(engineer)
        # 如果工程师不存在，可以选择忽略或自动创建
        # 这里选择忽略（不处理不存在的工程师）

    db.commit()
    db.refresh(new_order)  # 刷新获取完整数据（包括关联关系）
    return new_order


# ========== 工单更新 ==========

def update_order(db: Session, order_id: str, order_data: OrderUpdate) -> Optional[Order]:
    """更新工单（只更新传入的非空字段）"""
    order = get_order(db, order_id)
    if not order:
        return None

    if order_data.address is not None:
        order.address = order_data.address

    if order_data.status is not None:
        # 可以加状态校验
        valid_statuses = ["待处理", "处理中", "已完成"]
        if order_data.status in valid_statuses:
            order.status = order_data.status
        else:
            raise ValueError(f"无效状态：{order_data.status}，可选值：{valid_statuses}")

    if order_data.customer_name is not None:
        customer = db.query(Customer).filter(Customer.name == order_data.customer_name).first()
        if not customer:
            customer = Customer(name=order_data.customer_name)
            db.add(customer)
            db.flush()
        order.customer_id = customer.id

    db.commit()
    db.refresh(order)
    return order


# ========== 工单删除 ==========

def delete_order(db: Session, order_id: str) -> bool:
    """删除工单（返回是否删除成功）"""
    order = get_order(db, order_id)
    if not order:
        return False
    db.delete(order)
    db.commit()
    return True


# ========== 统计查询 ==========

def get_order_stats(db: Session) -> dict:
    """获取工单统计信息"""
    total = db.query(Order).count()
    pending = db.query(Order).filter(Order.status == "待处理").count()
    processing = db.query(Order).filter(Order.status == "处理中").count()
    completed = db.query(Order).filter(Order.status == "已完成").count()

    return {
        "total": total,
        "pending": pending,
        "processing": processing,
        "completed": completed
    }