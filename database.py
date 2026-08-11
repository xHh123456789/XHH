from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库连接字符串（请替换为你的实际密码）
DATABASE_URL = "mysql+pymysql://root:1234@localhost:3306/work_order_db?charset=utf8mb4"

# 创建引擎
engine = create_engine(
    DATABASE_URL,
    echo=True,  # 打印SQL日志，方便调试
    pool_pre_ping=True  # 连接前检查是否有效
)

# 创建 SessionLocal 类（用于生成数据库会话）
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类（所有模型继承自它）
Base = declarative_base()

# 依赖注入函数：每个请求创建一个数据库会话，请求结束后自动关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# database.py 末尾添加

# JWT 配置
SECRET_KEY = "your-secret-key-change-in-production"  # 生产环境必须使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token 有效期 60 分钟