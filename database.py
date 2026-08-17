import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ========== 加载环境变量 ==========
load_dotenv()

# ========== 数据库配置 ==========
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "work_order_db")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# ========== JWT 配置 ==========
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# ========== 创建引擎 ==========
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

# ========== 创建会话 ==========
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ========== 创建基类 ==========
Base = declarative_base()

# ========== 依赖注入 ==========
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()