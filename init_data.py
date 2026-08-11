# init_data.py
from database import SessionLocal, engine
from models import Base, Customer, Engineer, Order


def init_database():
    """初始化数据库：创建表 + 插入测试数据"""
    print("🔧 正在创建数据库表...")
    Base.metadata.create_all(engine)
    print("✅ 表创建完成")

    db = SessionLocal()

    try:
        # 先检查是否已有数据
        existing_count = db.query(Customer).count()
        if existing_count > 0:
            print(f"⚠️ 数据库已有 {existing_count} 条客户数据，跳过初始化")
            return

        print("🌱 正在插入测试数据...")

        # 1. 创建客户
        customers = [
            Customer(name="张三", phone="13800001111"),
            Customer(name="李四", phone="13800002222"),
            Customer(name="王五", phone="13800003333"),
            Customer(name="赵六", phone="13800004444"),
        ]
        db.add_all(customers)
        db.flush()
        print(f"   ✅ 创建了 {len(customers)} 个客户")

        # 2. 创建工程师
        engineers = [
            Engineer(name="张工", phone="13900001111", skill="宽带装维"),
            Engineer(name="李工", phone="13900002222", skill="光缆熔接"),
            Engineer(name="王工", phone="13900003333", skill="设备调试"),
            Engineer(name="刘工", phone="13900004444", skill="线路巡检"),
        ]
        db.add_all(engineers)
        db.flush()
        print(f"   ✅ 创建了 {len(engineers)} 个工程师")

        # 3. 创建工单
        orders = [
            Order(order_id="T100", address="达州市通川区朝阳路1号", status="待处理", customer_id=customers[0].id),
            Order(order_id="T101", address="达州市达川区南外镇2号", status="处理中", customer_id=customers[1].id),
            Order(order_id="T102", address="达州市宣汉县东乡镇3号", status="已完成", customer_id=customers[2].id),
            Order(order_id="T103", address="达州市大竹县竹阳镇4号", status="待处理", customer_id=customers[3].id),
            Order(order_id="T104", address="达州市渠县渠江镇5号", status="处理中", customer_id=customers[0].id),
        ]
        db.add_all(orders)
        db.flush()
        print(f"   ✅ 创建了 {len(orders)} 个工单")

        # 4. 建立多对多关系（工单分配工程师）
        # T100 → 张工 + 李工
        orders[0].engineers.append(engineers[0])
        orders[0].engineers.append(engineers[1])
        # T101 → 李工
        orders[1].engineers.append(engineers[1])
        # T102 → 王工
        orders[2].engineers.append(engineers[2])
        # T103 → 张工 + 刘工
        orders[3].engineers.append(engineers[0])
        orders[3].engineers.append(engineers[3])
        # T104 → 王工 + 刘工
        orders[4].engineers.append(engineers[2])
        orders[4].engineers.append(engineers[3])

        db.commit()
        print("✅ 数据库初始化完成！")
        print("\n📊 测试数据概览：")
        print(f"   - 客户数: {len(customers)}")
        print(f"   - 工程师数: {len(engineers)}")
        print(f"   - 工单数: {len(orders)}")
        print("\n💡 可以启动服务访问 http://127.0.0.1:8000/docs 进行测试")

    except Exception as e:
        db.rollback()
        print(f"❌ 初始化失败: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()