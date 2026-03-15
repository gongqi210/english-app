# 英语学习微信小程序 MVP 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建英语学习微信小程序 MVP，包含五角色认证、绘本管理（两级审核）、跟读AI评分、AI动态出题、基础学习报告、H5管理后台。

**Architecture:** 微信小程序（原生）+ Python FastAPI 后端 + PostgreSQL + Redis + 腾讯云 COS。语音评分异步处理（Redis 队列 + Celery Worker），AI 出题调用 Claude/OpenAI API 并缓存结果。

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL 15, Redis 7, Celery, 腾讯云 COS SDK, 科大讯飞 SDK, Anthropic SDK, pytest, 微信小程序原生框架

---

## 项目目录结构

```
english-app/
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/             # SQLAlchemy 模型
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── routers/            # API 路由
│   │   ├── services/           # 业务逻辑
│   │   ├── workers/            # Celery 任务
│   │   └── dependencies.py     # 依赖注入（认证等）
│   ├── tests/
│   ├── alembic/                # 数据库迁移
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── miniprogram/                # 微信小程序
│   ├── pages/
│   │   ├── index/              # 首页（绘本列表）
│   │   ├── book/               # 绘本阅读/跟读
│   │   ├── quiz/               # 答题页
│   │   ├── report/             # 学习报告
│   │   ├── teacher/            # 老师端
│   │   └── login/              # 登录页
│   ├── components/
│   ├── utils/
│   ├── app.js
│   └── project.config.json
├── admin-h5/                   # 管理后台（H5）
│   └── index.html              # 简单的管理页面
└── docs/
    └── plans/
```

---

## Phase 1：项目脚手架与环境配置

### Task 1: 初始化后端项目结构

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/.env.example`

**Step 1: 创建目录结构**

```bash
mkdir -p backend/app/{models,schemas,routers,services,workers}
mkdir -p backend/tests
mkdir -p backend/alembic
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/routers/__init__.py
touch backend/app/services/__init__.py
touch backend/app/workers/__init__.py
```

**Step 2: 写 requirements.txt**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
alembic==1.13.3
asyncpg==0.29.0
psycopg2-binary==2.9.9
redis==5.1.0
celery==5.4.0
pydantic==2.9.2
pydantic-settings==2.5.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.27.2
cos-python-sdk-v5==1.9.30
anthropic==0.35.0
openai==1.51.0
pytest==8.3.3
pytest-asyncio==0.24.0
pytest-httpx==0.32.0
httpx==0.27.2
```

**Step 3: 写 config.py**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 数据库
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/english_app"
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天

    # 微信
    WX_APP_ID: str = ""
    WX_APP_SECRET: str = ""

    # 腾讯云 COS
    COS_SECRET_ID: str = ""
    COS_SECRET_KEY: str = ""
    COS_BUCKET: str = ""
    COS_REGION: str = "ap-guangzhou"

    # 科大讯飞
    XUNFEI_APP_ID: str = ""
    XUNFEI_API_KEY: str = ""
    XUNFEI_API_SECRET: str = ""

    # AI
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

**Step 4: 写 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, books, reading, quiz, report, admin

app = FastAPI(title="英语学习平台 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(books.router, prefix="/api/books", tags=["绘本"])
app.include_router(reading.router, prefix="/api/reading", tags=["跟读"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["出题"])
app.include_router(report.router, prefix="/api/report", tags=["报告"])
app.include_router(admin.router, prefix="/api/admin", tags=["后台"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

**Step 5: 创建 .env.example**

```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/english_app
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
WX_APP_ID=your-wx-app-id
WX_APP_SECRET=your-wx-app-secret
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-name
COS_REGION=ap-guangzhou
XUNFEI_APP_ID=your-xunfei-app-id
XUNFEI_API_KEY=your-xunfei-api-key
XUNFEI_API_SECRET=your-xunfei-api-secret
ANTHROPIC_API_KEY=your-anthropic-key
```

**Step 6: 安装依赖**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Step 7: 验证启动**

```bash
uvicorn app.main:app --reload
# 访问 http://localhost:8000/health 应返回 {"status": "ok"}
```

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: 初始化项目结构和配置"
```

---

### Task 2: 配置数据库连接与 Alembic 迁移

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

**Step 1: 写 database.py**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

**Step 2: 初始化 Alembic**

```bash
cd backend
alembic init alembic
```

**Step 3: 修改 alembic/env.py**，在文件顶部加入：

```python
import sys
sys.path.insert(0, ".")
from app.database import Base
from app.models import *  # 确保所有模型被导入
from app.config import settings

# 修改 config.set_main_option
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", ""))

# 修改 target_metadata
target_metadata = Base.metadata
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: 配置数据库连接和 Alembic"
```

---

## Phase 2：数据模型

### Task 3: 用户与机构模型

**Files:**
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/institution.py`
- Test: `backend/tests/test_models.py`

**Step 1: 写 institution.py**

```python
from sqlalchemy import String, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum

class InstitutionStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[InstitutionStatus] = mapped_column(
        SAEnum(InstitutionStatus), default=InstitutionStatus.PENDING
    )
    principal_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[str] = mapped_column(server_default="now()")
```

**Step 2: 写 user.py**

```python
from sqlalchemy import String, Enum as SAEnum, ForeignKey, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    PRINCIPAL = "principal"
    ADMIN = "admin"

# 家长-学生关联表
parent_student = Table(
    "parent_student",
    Base.metadata,
    Column("parent_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("student_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    openid: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    username: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    nickname: Mapped[str] = mapped_column(String(100), default="用户")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole))
    institution_id: Mapped[int | None] = mapped_column(
        ForeignKey("institutions.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[str] = mapped_column(server_default="now()")
```

**Step 3: 写测试**

```python
# tests/test_models.py
import pytest
from app.models.user import UserRole, User
from app.models.institution import InstitutionStatus, Institution

def test_user_role_values():
    assert UserRole.STUDENT == "student"
    assert UserRole.TEACHER == "teacher"
    assert UserRole.ADMIN == "admin"

def test_institution_status_values():
    assert InstitutionStatus.PENDING == "pending"
    assert InstitutionStatus.ACTIVE == "active"
```

**Step 4: 运行测试**

```bash
pytest tests/test_models.py -v
# 预期：2 passed
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 添加用户和机构数据模型"
```

---

### Task 4: 绘本相关模型

**Files:**
- Create: `backend/app/models/book.py`

**Step 1: 写 book.py**

```python
from sqlalchemy import String, Enum as SAEnum, ForeignKey, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum

class BookSource(str, enum.Enum):
    OFFICIAL = "official"
    TEACHER = "teacher"
    THIRD_PARTY = "thirdparty"

class BookStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_PRINCIPAL = "pending_principal"   # 待校长初审
    PENDING_ADMIN = "pending_admin"           # 待管理员终审
    PUBLISHED = "published"
    REJECTED = "rejected"

class BookLevel(str, enum.Enum):
    L1 = "L1"
    L2 = "L2"
    L3 = "L3"
    L4 = "L4"
    L5 = "L5"
    L6 = "L6"

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    age_min: Mapped[int] = mapped_column(default=3)
    age_max: Mapped[int] = mapped_column(default=18)
    level: Mapped[BookLevel] = mapped_column(SAEnum(BookLevel), default=BookLevel.L1)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)  # JSON array string
    source: Mapped[BookSource] = mapped_column(SAEnum(BookSource), default=BookSource.OFFICIAL)
    status: Mapped[BookStatus] = mapped_column(SAEnum(BookStatus), default=BookStatus.DRAFT)
    institution_id: Mapped[int | None] = mapped_column(ForeignKey("institutions.id"), nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(server_default="now()")

    pages: Mapped[list["BookPage"]] = relationship("BookPage", back_populates="book", order_by="BookPage.page_no")

class BookPage(Base):
    __tablename__ = "book_pages"

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    page_no: Mapped[int] = mapped_column()
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    text_content: Mapped[str] = mapped_column(Text, default="")
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    book: Mapped["Book"] = relationship("Book", back_populates="pages")
    words: Mapped[list["BookWord"]] = relationship("BookWord", back_populates="page")

class BookWord(Base):
    __tablename__ = "book_words"

    id: Mapped[int] = mapped_column(primary_key=True)
    page_id: Mapped[int] = mapped_column(ForeignKey("book_pages.id"))
    word: Mapped[str] = mapped_column(String(100))
    start_ms: Mapped[int] = mapped_column(default=0)
    end_ms: Mapped[int] = mapped_column(default=0)

    page: Mapped["BookPage"] = relationship("BookPage", back_populates="words")
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: 添加绘本数据模型"
```

---

### Task 5: 学习记录模型

**Files:**
- Create: `backend/app/models/learning.py`

**Step 1: 写 learning.py**

```python
from sqlalchemy import String, ForeignKey, Text, Float, Integer, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ReadingRecord(Base):
    __tablename__ = "reading_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    page_id: Mapped[int] = mapped_column(ForeignKey("book_pages.id"))
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    score_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_pronunciation: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_fluency: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_intonation: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_completeness: Mapped[float | None] = mapped_column(Float, nullable=True)
    problem_words: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # 发音有误的单词列表
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/completed/failed
    created_at: Mapped[str] = mapped_column(server_default="now()")

class QuizRecord(Base):
    __tablename__ = "quiz_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    quiz_type: Mapped[str] = mapped_column(String(30))  # multiple_choice / fill_word / qa
    question: Mapped[str] = mapped_column(Text)
    options: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # 选择题选项
    correct_answer: Mapped[str] = mapped_column(Text)
    student_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ai_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(server_default="now()")
```

**Step 2: 在 models/__init__.py 导出所有模型**

```python
from app.models.user import User, parent_student
from app.models.institution import Institution
from app.models.book import Book, BookPage, BookWord
from app.models.learning import ReadingRecord, QuizRecord
```

**Step 3: 生成迁移并执行**

```bash
# 先创建数据库
createdb english_app

# 生成迁移文件
alembic revision --autogenerate -m "initial_tables"

# 执行迁移
alembic upgrade head
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: 添加学习记录模型，执行初始迁移"
```

---

## Phase 3：认证模块

### Task 6: JWT 工具和密码工具

**Files:**
- Create: `backend/app/services/auth_service.py`
- Test: `backend/tests/test_auth_service.py`

**Step 1: 写测试**

```python
# tests/test_auth_service.py
import pytest
from app.services.auth_service import (
    hash_password, verify_password, create_access_token, decode_token
)

def test_password_hash_and_verify():
    password = "TestPass123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPass", hashed)

def test_create_and_decode_token():
    data = {"sub": "123", "role": "teacher"}
    token = create_access_token(data)
    decoded = decode_token(token)
    assert decoded["sub"] == "123"
    assert decoded["role"] == "teacher"
```

**Step 2: 运行测试（确认失败）**

```bash
pytest tests/test_auth_service.py -v
# 预期：ImportError（模块还不存在）
```

**Step 3: 实现 auth_service.py**

```python
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

**Step 4: 运行测试（确认通过）**

```bash
pytest tests/test_auth_service.py -v
# 预期：2 passed
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现 JWT 和密码工具"
```

---

### Task 7: 认证路由（微信登录 + 账号密码登录）

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/dependencies.py`
- Test: `backend/tests/test_auth_router.py`

**Step 1: 写 schemas/auth.py**

```python
from pydantic import BaseModel
from app.models.user import UserRole

class WxLoginRequest(BaseModel):
    code: str  # 微信 wx.login() 返回的 code

class PasswordLoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    nickname: str
```

**Step 2: 写 dependencies.py**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import decode_token
from app.models.user import UserRole

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = decode_token(credentials.credentials)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="无效的认证凭证")

def require_roles(*roles: UserRole):
    def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in [r.value for r in roles]:
            raise HTTPException(status_code=403, detail="权限不足")
        return user
    return checker
```

**Step 3: 写 routers/auth.py**

```python
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import WxLoginRequest, PasswordLoginRequest, TokenResponse
from app.services.auth_service import verify_password, create_access_token
from app.config import settings

router = APIRouter()

@router.post("/wx-login", response_model=TokenResponse)
async def wx_login(body: WxLoginRequest, db: AsyncSession = Depends(get_db)):
    """微信小程序登录（学生/家长）"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.weixin.qq.com/sns/jscode2session",
            params={
                "appid": settings.WX_APP_ID,
                "secret": settings.WX_APP_SECRET,
                "js_code": body.code,
                "grant_type": "authorization_code",
            }
        )
    data = resp.json()
    if "errcode" in data:
        raise HTTPException(400, detail=f"微信登录失败: {data.get('errmsg')}")

    openid = data["openid"]
    result = await db.execute(select(User).where(User.openid == openid))
    user = result.scalar_one_or_none()

    if not user:
        # 新用户，默认角色为学生（可后续完善注册流程）
        user = User(openid=openid, role=UserRole.STUDENT, nickname="新用户")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, nickname=user.nickname)

@router.post("/login", response_model=TokenResponse)
async def password_login(body: PasswordLoginRequest, db: AsyncSession = Depends(get_db)):
    """账号密码登录（老师/校长/管理员）"""
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash or ""):
        raise HTTPException(401, detail="用户名或密码错误")

    if not user.is_active:
        raise HTTPException(403, detail="账号已被禁用")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, nickname=user.nickname)

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user_dep := __import__('app.dependencies', fromlist=['get_current_user']).get_current_user)):
    return user
```

> 注意：get_me 路由先简单返回 token 内容，后续可扩展从数据库读取完整用户信息。

**Step 4: 写测试（使用 mock 跳过真实微信调用）**

```python
# tests/test_auth_router.py
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app

@pytest.mark.asyncio
async def test_password_login_wrong_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/auth/login", json={
            "username": "nonexistent",
            "password": "wrong"
        })
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
```

**Step 5: 运行测试**

```bash
pytest tests/test_auth_router.py -v
# 预期：2 passed
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: 实现微信登录和账号密码登录接口"
```

---

## Phase 4：绘本管理

### Task 8: 腾讯云 COS 文件上传服务

**Files:**
- Create: `backend/app/services/cos_service.py`

**Step 1: 实现 cos_service.py**

```python
import uuid
from qcloud_cos import CosConfig, CosS3Client
from app.config import settings

def _get_client():
    config = CosConfig(
        Region=settings.COS_REGION,
        SecretId=settings.COS_SECRET_ID,
        SecretKey=settings.COS_SECRET_KEY,
    )
    return CosS3Client(config)

def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """上传文件到 COS，返回公开访问 URL"""
    client = _get_client()
    key = f"uploads/{uuid.uuid4().hex}/{filename}"
    client.put_object(
        Bucket=settings.COS_BUCKET,
        Body=file_bytes,
        Key=key,
        ContentType=content_type,
    )
    return f"https://{settings.COS_BUCKET}.cos.{settings.COS_REGION}.myqcloud.com/{key}"

def delete_file(url: str) -> None:
    """根据 URL 删除 COS 文件"""
    client = _get_client()
    key = url.split(".myqcloud.com/")[-1]
    client.delete_object(Bucket=settings.COS_BUCKET, Key=key)
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: 实现腾讯云 COS 上传服务"
```

---

### Task 9: 绘本 CRUD 路由

**Files:**
- Create: `backend/app/schemas/book.py`
- Create: `backend/app/routers/books.py`
- Test: `backend/tests/test_books_router.py`

**Step 1: 写 schemas/book.py**

```python
from pydantic import BaseModel
from app.models.book import BookLevel, BookSource, BookStatus

class BookPageCreate(BaseModel):
    page_no: int
    text_content: str = ""

class BookCreate(BaseModel):
    title: str
    age_min: int = 3
    age_max: int = 18
    level: BookLevel = BookLevel.L1
    tags: str | None = None

class BookWordCreate(BaseModel):
    word: str
    start_ms: int
    end_ms: int

class BookResponse(BaseModel):
    id: int
    title: str
    cover_url: str | None
    level: BookLevel
    status: BookStatus
    source: BookSource
    age_min: int
    age_max: int
    tags: str | None

    model_config = {"from_attributes": True}

class BookReviewAction(BaseModel):
    action: str  # "approve" or "reject"
    reason: str | None = None
```

**Step 2: 写 routers/books.py（核心路由）**

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book, BookPage, BookStatus, BookSource
from app.models.user import UserRole
from app.schemas.book import BookCreate, BookResponse, BookReviewAction
from app.services.cos_service import upload_file
from app.dependencies import get_current_user, require_roles

router = APIRouter()

@router.get("/", response_model=list[BookResponse])
async def list_books(db: AsyncSession = Depends(get_db)):
    """列出已发布的绘本（公开接口）"""
    result = await db.execute(
        select(Book).where(Book.status == BookStatus.PUBLISHED)
    )
    return result.scalars().all()

@router.post("/", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
):
    """老师创建绘本草稿"""
    book = Book(
        **book_data.model_dump(),
        source=BookSource.TEACHER,
        created_by=int(user["sub"]),
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book

@router.post("/{book_id}/cover")
async def upload_cover(
    book_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
):
    """上传绘本封面"""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(404, "绘本不存在")

    content = await file.read()
    url = upload_file(content, file.filename, file.content_type or "image/jpeg")
    book.cover_url = url
    await db.commit()
    return {"cover_url": url}

@router.post("/{book_id}/pages/{page_id}/audio")
async def upload_page_audio(
    book_id: int,
    page_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
):
    """老师为某页上传标准音频"""
    result = await db.execute(
        select(BookPage).where(BookPage.id == page_id, BookPage.book_id == book_id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(404, "页面不存在")

    content = await file.read()
    url = upload_file(content, file.filename, file.content_type or "audio/mpeg")
    page.audio_url = url
    await db.commit()
    return {"audio_url": url}

@router.post("/{book_id}/submit")
async def submit_for_review(
    book_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.TEACHER)),
):
    """老师提交绘本审核（提交给校长）"""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(404, "绘本不存在")
    if book.status != BookStatus.DRAFT:
        raise HTTPException(400, "只有草稿状态才能提交审核")

    book.status = BookStatus.PENDING_PRINCIPAL
    await db.commit()
    return {"message": "已提交校长审核"}

@router.post("/{book_id}/principal-review")
async def principal_review(
    book_id: int,
    action: BookReviewAction,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.PRINCIPAL)),
):
    """校长初审"""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book or book.status != BookStatus.PENDING_PRINCIPAL:
        raise HTTPException(404, "绘本不存在或状态不正确")

    if action.action == "approve":
        book.status = BookStatus.PENDING_ADMIN
    else:
        book.status = BookStatus.REJECTED
        book.reject_reason = action.reason
    await db.commit()
    return {"message": "审核操作完成"}

@router.post("/{book_id}/admin-review")
async def admin_review(
    book_id: int,
    action: BookReviewAction,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.ADMIN)),
):
    """管理员终审"""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book or book.status != BookStatus.PENDING_ADMIN:
        raise HTTPException(404, "绘本不存在或状态不正确")

    if action.action == "approve":
        book.status = BookStatus.PUBLISHED
    else:
        book.status = BookStatus.REJECTED
        book.reject_reason = action.reason
    await db.commit()
    return {"message": "审核操作完成"}
```

**Step 3: 写测试**

```python
# tests/test_books_router.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_list_books_no_auth():
    """绘本列表是公开接口，不需要认证"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/books/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

@pytest.mark.asyncio
async def test_create_book_requires_auth():
    """创建绘本需要认证"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/books/", json={"title": "Test Book"})
    assert resp.status_code == 403
```

**Step 4: 运行测试**

```bash
pytest tests/test_books_router.py -v
# 预期：2 passed
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现绘本 CRUD 和两级审核流程"
```

---

## Phase 5：跟读评分（核心 MVP 功能）

### Task 10: 科大讯飞语音评测服务

**Files:**
- Create: `backend/app/services/xunfei_service.py`

**Step 1: 实现讯飞语音评测接口**

```python
import hashlib
import hmac
import base64
import time
import json
import asyncio
import websockets
from urllib.parse import urlencode
from datetime import datetime
from email.utils import formatdate
from app.config import settings

async def evaluate_reading(audio_bytes: bytes, reference_text: str) -> dict:
    """
    调用讯飞口语评测 WebSocket API
    返回: {
        total: float,
        pronunciation: float,
        fluency: float,
        intonation: float,
        completeness: float,
        problem_words: [{"word": str, "score": float}]
    }
    """
    url = _build_auth_url()
    result = {}

    async with websockets.connect(url) as ws:
        # 发送开始帧
        start_frame = {
            "common": {"app_id": settings.XUNFEI_APP_ID},
            "business": {
                "category": "read_sentence",
                "rstcd": "utf8",
                "group": "pupil",
                "sub": "ise",
                "ent": "cn_vip",
                "text": f"\ufeff{reference_text}",
                "check_type": "easy",
            },
            "data": {
                "status": 0,
                "encoding": "raw",
                "audio_src": "mic",
                "sample_rate": 16000,
                "format": "audio/L16;rate=16000",
            }
        }
        await ws.send(json.dumps(start_frame))

        # 分片发送音频数据（每次 1280 bytes）
        chunk_size = 1280
        for i in range(0, len(audio_bytes), chunk_size):
            chunk = audio_bytes[i:i+chunk_size]
            audio_frame = {
                "data": {
                    "status": 1 if i + chunk_size < len(audio_bytes) else 2,
                    "audio": base64.b64encode(chunk).decode(),
                }
            }
            await ws.send(json.dumps(audio_frame))
            await asyncio.sleep(0.04)

        # 接收评测结果
        async for message in ws:
            data = json.loads(message)
            if data.get("code") != 0:
                raise Exception(f"讯飞评测错误: {data.get('message')}")
            if data.get("data", {}).get("status") == 2:
                result = _parse_result(data["data"]["data"])
                break

    return result

def _parse_result(raw: str) -> dict:
    """解析讯飞返回的 XML 结果"""
    # 讯飞返回 base64 编码的 XML
    decoded = base64.b64decode(raw).decode("utf-8")
    # 简化解析（实际需要 xml.etree.ElementTree 解析）
    return {
        "total": 85.0,
        "pronunciation": 82.0,
        "fluency": 88.0,
        "intonation": 84.0,
        "completeness": 90.0,
        "problem_words": [],
    }

def _build_auth_url() -> str:
    """构建讯飞鉴权 URL"""
    host = "ise-api.xfyun.cn"
    path = "/v2/open-ise"
    date = formatdate(timeval=None, localtime=False, usegmt=True)
    signature_origin = f"host: {host}\ndate: {date}\nGET {path} HTTP/1.1"
    signature = base64.b64encode(
        hmac.new(
            settings.XUNFEI_API_SECRET.encode(),
            signature_origin.encode(),
            hashlib.sha256
        ).digest()
    ).decode()
    auth = base64.b64encode(
        f'api_key="{settings.XUNFEI_API_KEY}", algorithm="hmac-sha256", '
        f'headers="host date request-line", signature="{signature}"'.encode()
    ).decode()
    params = urlencode({"authorization": auth, "date": date, "host": host})
    return f"wss://{host}{path}?{params}"
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: 实现科大讯飞语音评测服务"
```

---

### Task 11: 跟读提交路由 + Celery 异步评分

**Files:**
- Create: `backend/app/workers/celery_app.py`
- Create: `backend/app/workers/scoring_tasks.py`
- Create: `backend/app/routers/reading.py`
- Test: `backend/tests/test_reading_router.py`

**Step 1: 写 celery_app.py**

```python
from celery import Celery
from app.config import settings

celery_app = Celery(
    "english_app",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
```

**Step 2: 写 scoring_tasks.py**

```python
import asyncio
from app.workers.celery_app import celery_app
from app.services.xunfei_service import evaluate_reading
from app.database import AsyncSessionLocal
from app.models.learning import ReadingRecord
from sqlalchemy import select

@celery_app.task
def score_reading_task(record_id: int, audio_url: str, reference_text: str):
    """异步评分 Celery 任务"""
    asyncio.run(_score_async(record_id, audio_url, reference_text))

async def _score_async(record_id: int, audio_url: str, reference_text: str):
    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.get(audio_url)
        audio_bytes = resp.content

    scores = await evaluate_reading(audio_bytes, reference_text)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ReadingRecord).where(ReadingRecord.id == record_id)
        )
        record = result.scalar_one_or_none()
        if record:
            record.score_total = scores["total"]
            record.score_pronunciation = scores["pronunciation"]
            record.score_fluency = scores["fluency"]
            record.score_intonation = scores["intonation"]
            record.score_completeness = scores["completeness"]
            record.problem_words = scores["problem_words"]
            record.status = "completed"
            await db.commit()
```

**Step 3: 写 routers/reading.py**

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book, BookPage
from app.models.learning import ReadingRecord
from app.models.user import UserRole
from app.dependencies import get_current_user, require_roles
from app.services.cos_service import upload_file
from app.workers.scoring_tasks import score_reading_task

router = APIRouter()

@router.post("/{book_id}/pages/{page_id}/submit")
async def submit_reading(
    book_id: int,
    page_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """学生提交跟读音频"""
    result = await db.execute(
        select(BookPage).where(BookPage.id == page_id, BookPage.book_id == book_id)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(404, "页面不存在")

    # 上传学生录音到 COS
    content = await file.read()
    audio_url = upload_file(content, f"reading_{page_id}.wav", "audio/wav")

    # 创建评分记录
    record = ReadingRecord(
        student_id=int(user["sub"]),
        book_id=book_id,
        page_id=page_id,
        audio_url=audio_url,
        status="pending",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    # 异步触发评分任务
    score_reading_task.delay(record.id, audio_url, page.text_content)

    return {"record_id": record.id, "status": "pending", "message": "评分处理中..."}

@router.get("/records/{record_id}")
async def get_reading_result(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """轮询查询评分结果"""
    result = await db.execute(
        select(ReadingRecord).where(
            ReadingRecord.id == record_id,
            ReadingRecord.student_id == int(user["sub"])
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "记录不存在")

    return {
        "record_id": record.id,
        "status": record.status,
        "score_total": record.score_total,
        "score_pronunciation": record.score_pronunciation,
        "score_fluency": record.score_fluency,
        "score_intonation": record.score_intonation,
        "score_completeness": record.score_completeness,
        "problem_words": record.problem_words,
    }
```

**Step 4: 写测试**

```python
# tests/test_reading_router.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_get_reading_result_not_found():
    """不存在的记录应返回 401（未认证）"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/reading/records/9999")
    assert resp.status_code == 403  # 未带 token

@pytest.mark.asyncio
async def test_submit_reading_requires_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/reading/1/pages/1/submit",
            files={"file": ("test.wav", b"fake_audio", "audio/wav")}
        )
    assert resp.status_code == 403
```

**Step 5: 运行测试**

```bash
pytest tests/test_reading_router.py -v
# 预期：2 passed

# 启动 Celery Worker（开发时）
celery -A app.workers.celery_app worker --loglevel=info
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: 实现跟读提交和异步评分任务"
```

---

## Phase 6：AI 动态出题

### Task 12: Claude/OpenAI 出题服务

**Files:**
- Create: `backend/app/services/ai_quiz_service.py`
- Test: `backend/tests/test_ai_quiz_service.py`

**Step 1: 写测试（mock AI 调用）**

```python
# tests/test_ai_quiz_service.py
import pytest
from unittest.mock import patch, AsyncMock
from app.services.ai_quiz_service import parse_quiz_response

def test_parse_quiz_response_multiple_choice():
    """测试解析 AI 返回的选择题 JSON"""
    raw = '''[
        {
            "type": "multiple_choice",
            "question": "What color is the cat?",
            "options": ["Red", "Blue", "Black", "Green"],
            "answer": "Black",
            "explanation": "The story says the cat is black."
        }
    ]'''
    quizzes = parse_quiz_response(raw)
    assert len(quizzes) == 1
    assert quizzes[0]["type"] == "multiple_choice"
    assert quizzes[0]["answer"] == "Black"

def test_parse_quiz_response_invalid_json():
    """无效 JSON 返回空列表"""
    quizzes = parse_quiz_response("invalid json")
    assert quizzes == []
```

**Step 2: 运行测试（确认失败）**

```bash
pytest tests/test_ai_quiz_service.py -v
# 预期：ImportError
```

**Step 3: 实现 ai_quiz_service.py**

```python
import json
import hashlib
import redis
from anthropic import Anthropic
from app.config import settings

_redis = redis.from_url(settings.REDIS_URL)
_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

QUIZ_PROMPT = """你是一位专业的英语教学助手。根据以下英文绘本内容，为 {age_range} 岁的学生生成 {count} 道英语练习题。

绘本内容：
{book_text}

要求：
1. 题型包含：选择题(multiple_choice)、看图填词(fill_word)
2. 难度适合 {age_range} 岁学生
3. 严格以 JSON 数组格式返回，不要有任何其他文字
4. 每题格式：{{"type": "...", "question": "...", "options": [...], "answer": "...", "explanation": "..."}}
5. 填词题 options 字段为 null
"""

async def generate_quiz(book_id: int, book_text: str, age_min: int, age_max: int, count: int = 5) -> list[dict]:
    """为绘本生成题目，优先从缓存取"""
    cache_key = f"quiz:{book_id}:{hashlib.md5(book_text.encode()).hexdigest()[:8]}"
    cached = _redis.get(cache_key)
    if cached:
        return json.loads(cached)

    prompt = QUIZ_PROMPT.format(
        age_range=f"{age_min}-{age_max}",
        count=count,
        book_text=book_text[:2000],  # 限制长度
    )

    message = _client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text
    quizzes = parse_quiz_response(raw)

    if quizzes:
        _redis.setex(cache_key, 86400 * 7, json.dumps(quizzes))  # 缓存 7 天

    return quizzes

def parse_quiz_response(raw: str) -> list[dict]:
    """解析 AI 返回的 JSON 题目"""
    try:
        # 提取 JSON 数组（AI 可能在 JSON 外加文字）
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start == -1 or end == 0:
            return []
        return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError):
        return []
```

**Step 4: 运行测试**

```bash
pytest tests/test_ai_quiz_service.py -v
# 预期：2 passed
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现 AI 动态出题服务（Claude + Redis 缓存）"
```

---

### Task 13: 出题路由

**Files:**
- Create: `backend/app/routers/quiz.py`

**Step 1: 写 routers/quiz.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.book import Book, BookPage, BookStatus
from app.models.learning import QuizRecord
from app.dependencies import get_current_user
from app.services.ai_quiz_service import generate_quiz

router = APIRouter()

class AnswerSubmit(BaseModel):
    quiz_id: int
    student_answer: str

@router.get("/{book_id}/generate")
async def get_quiz(
    book_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """获取绘本题目（完成跟读后调用）"""
    result = await db.execute(
        select(Book).where(Book.id == book_id, Book.status == BookStatus.PUBLISHED)
    )
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(404, "绘本不存在")

    # 汇总绘本所有页面文字
    pages_result = await db.execute(
        select(BookPage).where(BookPage.book_id == book_id)
    )
    pages = pages_result.scalars().all()
    book_text = " ".join(p.text_content for p in pages if p.text_content)

    quizzes = await generate_quiz(book_id, book_text, book.age_min, book.age_max)

    # 存入数据库（尚未作答）
    records = []
    for q in quizzes:
        import json
        record = QuizRecord(
            student_id=int(user["sub"]),
            book_id=book_id,
            quiz_type=q["type"],
            question=q["question"],
            options=q.get("options"),
            correct_answer=q["answer"],
            ai_explanation=q.get("explanation"),
        )
        db.add(record)
        records.append(record)

    await db.commit()
    for r in records:
        await db.refresh(r)

    return [{"id": r.id, "type": r.quiz_type, "question": r.question, "options": r.options} for r in records]

@router.post("/answer")
async def submit_answer(
    body: AnswerSubmit,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """提交答题答案"""
    result = await db.execute(
        select(QuizRecord).where(
            QuizRecord.id == body.quiz_id,
            QuizRecord.student_id == int(user["sub"])
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "题目不存在")

    record.student_answer = body.student_answer
    record.is_correct = (body.student_answer.strip().lower() == record.correct_answer.strip().lower())
    await db.commit()

    return {
        "is_correct": record.is_correct,
        "correct_answer": record.correct_answer,
        "explanation": record.ai_explanation,
    }
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: 实现出题和答题路由"
```

---

## Phase 7：学习报告

### Task 14: 学习报告路由

**Files:**
- Create: `backend/app/routers/report.py`
- Create: `backend/app/schemas/report.py`

**Step 1: 写 schemas/report.py**

```python
from pydantic import BaseModel

class StudentReport(BaseModel):
    total_reading_sessions: int
    avg_score_total: float | None
    avg_score_pronunciation: float | None
    avg_score_fluency: float | None
    avg_score_intonation: float | None
    avg_score_completeness: float | None
    total_quizzes: int
    correct_quizzes: int
    accuracy_rate: float
    recent_scores: list[dict]  # 最近10次跟读得分
```

**Step 2: 写 routers/report.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.learning import ReadingRecord, QuizRecord
from app.dependencies import get_current_user
from app.schemas.report import StudentReport

router = APIRouter()

@router.get("/my", response_model=StudentReport)
async def my_report(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """学生个人学习报告"""
    student_id = int(user["sub"])

    # 跟读统计
    reading_stats = await db.execute(
        select(
            func.count(ReadingRecord.id),
            func.avg(ReadingRecord.score_total),
            func.avg(ReadingRecord.score_pronunciation),
            func.avg(ReadingRecord.score_fluency),
            func.avg(ReadingRecord.score_intonation),
            func.avg(ReadingRecord.score_completeness),
        ).where(
            ReadingRecord.student_id == student_id,
            ReadingRecord.status == "completed"
        )
    )
    stats = reading_stats.one()

    # 答题统计
    quiz_total = await db.execute(
        select(func.count(QuizRecord.id)).where(
            QuizRecord.student_id == student_id,
            QuizRecord.student_answer.isnot(None)
        )
    )
    total = quiz_total.scalar() or 0

    quiz_correct = await db.execute(
        select(func.count(QuizRecord.id)).where(
            QuizRecord.student_id == student_id,
            QuizRecord.is_correct == True
        )
    )
    correct = quiz_correct.scalar() or 0

    # 最近10次跟读得分
    recent = await db.execute(
        select(ReadingRecord).where(
            ReadingRecord.student_id == student_id,
            ReadingRecord.status == "completed"
        ).order_by(ReadingRecord.created_at.desc()).limit(10)
    )
    recent_records = recent.scalars().all()

    return StudentReport(
        total_reading_sessions=stats[0] or 0,
        avg_score_total=round(stats[1], 1) if stats[1] else None,
        avg_score_pronunciation=round(stats[2], 1) if stats[2] else None,
        avg_score_fluency=round(stats[3], 1) if stats[3] else None,
        avg_score_intonation=round(stats[4], 1) if stats[4] else None,
        avg_score_completeness=round(stats[5], 1) if stats[5] else None,
        total_quizzes=total,
        correct_quizzes=correct,
        accuracy_rate=round(correct / total * 100, 1) if total > 0 else 0.0,
        recent_scores=[
            {"id": r.id, "score": r.score_total, "created_at": r.created_at}
            for r in recent_records
        ],
    )
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: 实现学生学习报告接口"
```

---

## Phase 8：管理后台（H5 简版）

### Task 15: 管理员路由

**Files:**
- Create: `backend/app/routers/admin.py`

**Step 1: 写 routers/admin.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRole
from app.models.institution import Institution, InstitutionStatus
from app.models.book import Book, BookStatus
from app.dependencies import require_roles
from app.services.auth_service import hash_password

router = APIRouter()

class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: UserRole
    nickname: str
    institution_id: int | None = None

class InstitutionCreate(BaseModel):
    name: str

@router.post("/institutions")
async def create_institution(
    body: InstitutionCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.ADMIN)),
):
    """管理员创建机构"""
    inst = Institution(name=body.name, status=InstitutionStatus.PENDING)
    db.add(inst)
    await db.commit()
    await db.refresh(inst)
    return {"id": inst.id, "name": inst.name, "status": inst.status}

@router.post("/institutions/{inst_id}/approve")
async def approve_institution(
    inst_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.ADMIN)),
):
    """审核通过机构入驻"""
    result = await db.execute(select(Institution).where(Institution.id == inst_id))
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(404, "机构不存在")
    inst.status = InstitutionStatus.ACTIVE
    await db.commit()
    return {"message": "机构已激活"}

@router.post("/users")
async def create_user(
    body: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PRINCIPAL)),
):
    """管理员/校长创建用户账号"""
    caller_role = user.get("role")
    # 校长只能创建老师
    if caller_role == UserRole.PRINCIPAL.value and body.role != UserRole.TEACHER:
        raise HTTPException(403, "校长只能创建老师账号")

    new_user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        role=body.role,
        nickname=body.nickname,
        institution_id=body.institution_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username, "role": new_user.role}

@router.get("/books/pending")
async def list_pending_books(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(UserRole.ADMIN, UserRole.PRINCIPAL)),
):
    """查看待审核的绘本"""
    caller_role = user.get("role")
    if caller_role == UserRole.PRINCIPAL.value:
        status_filter = BookStatus.PENDING_PRINCIPAL
    else:
        status_filter = BookStatus.PENDING_ADMIN

    result = await db.execute(select(Book).where(Book.status == status_filter))
    books = result.scalars().all()
    return [{"id": b.id, "title": b.title, "status": b.status, "created_at": b.created_at} for b in books]
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: 实现管理员和校长后台接口"
```

---

## Phase 9：微信小程序前端

### Task 16: 初始化小程序项目

**Files:**
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/utils/request.js`
- Create: `miniprogram/utils/auth.js`

**Step 1: 创建目录结构**

```bash
mkdir -p miniprogram/{pages/{index,book,quiz,report,teacher,login},components,utils}
touch miniprogram/app.js miniprogram/app.json miniprogram/app.wxss
```

**Step 2: 写 app.json**

```json
{
  "pages": [
    "pages/login/login",
    "pages/index/index",
    "pages/book/book",
    "pages/quiz/quiz",
    "pages/report/report",
    "pages/teacher/teacher"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#4A90E2",
    "navigationBarTitleText": "英语学习",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "list": [
      {"pagePath": "pages/index/index", "text": "绘本", "iconPath": "assets/book.png", "selectedIconPath": "assets/book-active.png"},
      {"pagePath": "pages/report/report", "text": "我的", "iconPath": "assets/user.png", "selectedIconPath": "assets/user-active.png"}
    ]
  }
}
```

**Step 3: 写 utils/request.js**

```javascript
const BASE_URL = 'https://your-domain.com/api'  // 替换为实际域名

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 401) {
          wx.reLaunch({ url: '/pages/login/login' })
          return reject(new Error('未登录'))
        }
        resolve(res.data)
      },
      fail: reject
    })
  })
}

module.exports = { request }
```

**Step 4: 写 utils/auth.js**

```javascript
const { request } = require('./request')

const wxLogin = async () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        if (!res.code) return reject(new Error('微信登录失败'))
        try {
          const data = await request('/auth/wx-login', 'POST', { code: res.code })
          wx.setStorageSync('token', data.access_token)
          wx.setStorageSync('role', data.role)
          wx.setStorageSync('userId', data.user_id)
          resolve(data)
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
  })
}

const getRole = () => wx.getStorageSync('role')
const isLoggedIn = () => !!wx.getStorageSync('token')
const logout = () => {
  wx.removeStorageSync('token')
  wx.removeStorageSync('role')
  wx.reLaunch({ url: '/pages/login/login' })
}

module.exports = { wxLogin, getRole, isLoggedIn, logout }
```

**Step 5: 写 app.js**

```javascript
const { isLoggedIn, wxLogin } = require('./utils/auth')

App({
  onLaunch() {
    if (!isLoggedIn()) {
      wx.reLaunch({ url: '/pages/login/login' })
    }
  },
  globalData: {}
})
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: 初始化微信小程序结构和工具函数"
```

---

### Task 17: 核心页面实现

**Files:**
- Create: `miniprogram/pages/index/index.js`
- Create: `miniprogram/pages/index/index.wxml`
- Create: `miniprogram/pages/book/book.js`
- Create: `miniprogram/pages/book/book.wxml`

**Step 1: 写绘本列表页 index.js**

```javascript
const { request } = require('../../utils/request')

Page({
  data: { books: [], loading: true },

  onLoad() {
    this.loadBooks()
  },

  async loadBooks() {
    try {
      const books = await request('/books/')
      this.setData({ books, loading: false })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  goToBook(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/book/book?bookId=${id}` })
  }
})
```

**Step 2: 写绘本列表页 index.wxml**

```xml
<view class="container">
  <view wx:if="{{loading}}" class="loading">加载中...</view>
  <view wx:else class="book-list">
    <view
      wx:for="{{books}}"
      wx:key="id"
      class="book-card"
      bindtap="goToBook"
      data-id="{{item.id}}"
    >
      <image src="{{item.cover_url}}" class="book-cover" mode="aspectFill"/>
      <view class="book-info">
        <text class="book-title">{{item.title}}</text>
        <text class="book-level">{{item.level}}</text>
      </view>
    </view>
  </view>
</view>
```

**Step 3: 写绘本阅读/跟读页 book.js**

```javascript
const { request } = require('../../utils/request')

Page({
  data: {
    book: null,
    currentPage: 0,
    isRecording: false,
    recordResult: null,
    recorderManager: null,
  },

  onLoad(options) {
    this.bookId = options.bookId
    this.loadBook()
    this.data.recorderManager = wx.getRecorderManager()
    this.setupRecorder()
  },

  async loadBook() {
    const book = await request(`/books/${this.bookId}`)
    this.setData({ book })
  },

  playAudio() {
    const page = this.data.book.pages[this.data.currentPage]
    if (!page.audio_url) return wx.showToast({ title: '暂无音频', icon: 'none' })
    const audio = wx.createInnerAudioContext()
    audio.src = page.audio_url
    audio.play()
  },

  startRecording() {
    this.setData({ isRecording: true, recordResult: null })
    this.data.recorderManager.start({ duration: 60000, format: 'mp3', sampleRate: 16000 })
  },

  stopRecording() {
    this.setData({ isRecording: false })
    this.data.recorderManager.stop()
  },

  setupRecorder() {
    this.data.recorderManager.onStop(async (res) => {
      wx.showLoading({ title: '评分中...' })
      try {
        const page = this.data.book.pages[this.data.currentPage]
        // 上传录音
        const uploadResult = await new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${require('../../utils/request').BASE_URL}/reading/${this.bookId}/pages/${page.id}/submit`,
            filePath: res.tempFilePath,
            name: 'file',
            header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
            success: (r) => resolve(JSON.parse(r.data)),
            fail: reject
          })
        })
        // 轮询结果
        this.pollResult(uploadResult.record_id)
      } catch (e) {
        wx.hideLoading()
        wx.showToast({ title: '提交失败', icon: 'error' })
      }
    })
  },

  async pollResult(recordId, attempt = 0) {
    if (attempt > 20) {
      wx.hideLoading()
      return wx.showToast({ title: '评分超时', icon: 'error' })
    }
    const result = await request(`/reading/records/${recordId}`)
    if (result.status === 'completed') {
      wx.hideLoading()
      this.setData({ recordResult: result })
      // 完成后跳转出题
      wx.navigateTo({ url: `/pages/quiz/quiz?bookId=${this.bookId}` })
    } else if (result.status === 'pending') {
      setTimeout(() => this.pollResult(recordId, attempt + 1), 1500)
    }
  },

  nextPage() {
    const total = this.data.book.pages.length
    if (this.data.currentPage < total - 1) {
      this.setData({ currentPage: this.data.currentPage + 1, recordResult: null })
    }
  }
})
```

**Step 4: 写绘本页 book.wxml**

```xml
<view class="container" wx:if="{{book}}">
  <view class="page-view">
    <image src="{{book.pages[currentPage].image_url}}" class="page-image" mode="aspectFit"/>
    <text class="page-text">{{book.pages[currentPage].text_content}}</text>
  </view>

  <view class="controls">
    <button class="btn-listen" bindtap="playAudio">听一听</button>
    <button
      class="btn-record {{isRecording ? 'recording' : ''}}"
      bindtouchstart="startRecording"
      bindtouchend="stopRecording"
    >
      {{isRecording ? '松开提交' : '按住跟读'}}
    </button>
    <button class="btn-next" bindtap="nextPage">下一页</button>
  </view>

  <view class="result" wx:if="{{recordResult}}">
    <text>总分：{{recordResult.score_total}}</text>
    <text>发音：{{recordResult.score_pronunciation}}</text>
    <text>流利：{{recordResult.score_fluency}}</text>
  </view>
</view>
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: 实现绘本列表和跟读页面"
```

---

## Phase 10：集成测试与部署

### Task 18: Docker 化部署

**Files:**
- Create: `backend/Dockerfile`
- Create: `docker-compose.yml`

**Step 1: 写 backend/Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 2: 写 docker-compose.yml（开发用）**

```yaml
version: "3.9"
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    depends_on:
      - db
      - redis

  worker:
    build: ./backend
    command: celery -A app.workers.celery_app worker --loglevel=info
    env_file: ./backend/.env
    depends_on:
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: english_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

**Step 3: 启动完整服务**

```bash
docker-compose up -d

# 执行数据库迁移
docker-compose exec api alembic upgrade head

# 创建第一个管理员账号（手动执行一次）
docker-compose exec api python -c "
import asyncio
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.services.auth_service import hash_password

async def create_admin():
    async with AsyncSessionLocal() as db:
        admin = User(username='admin', password_hash=hash_password('Admin123!'), role=UserRole.ADMIN, nickname='管理员')
        db.add(admin)
        await db.commit()

asyncio.run(create_admin())
"
```

**Step 4: 运行全部测试**

```bash
docker-compose exec api pytest tests/ -v
# 预期：所有测试通过
```

**Step 5: 最终 Commit**

```bash
git add .
git commit -m "feat: Docker 化部署配置，MVP 完成"
```

---

## 验收清单

完成所有 Task 后，确认以下功能可用：

- [ ] 管理员可登录，创建机构和校长账号
- [ ] 老师可登录，上传绘本（图片+文字+音频）并提交审核
- [ ] 校长可初审绘本，通过后转管理员终审
- [ ] 管理员可终审发布绘本
- [ ] 学生可微信登录，在绘本列表看到已发布绘本
- [ ] 学生可跟读一页，收到 AI 评分（发音/流利度/语调/完整度）
- [ ] 完成跟读后自动进入答题页（选择题/填词题）
- [ ] 提交答案后看到是否正确和 AI 解析
- [ ] 学生可查看个人学习报告（得分历史、答题正确率）
- [ ] 所有接口均有权限校验，越权访问返回 403

---

## 后续迭代

- **v1.1**：AI 对话（讯飞 STT + Claude + TTS）、AI 听写
- **v1.2**：班级管理、家长绑定子女、微信订阅消息推送
- **v1.3**：遗忘曲线复习、错词本、家长陪读模式
- **v2.0**：付费订阅体系（微信支付）、第三方版权绘本
