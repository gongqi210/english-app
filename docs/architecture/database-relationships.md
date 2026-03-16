# 数据库勾稽关系设计文档

> **维护规则**：每次 schema 变更（新增表/列/关系）必须同步更新本文档，并在文末 [版本历史](#版本历史) 追加记录。

---

## 版本历史

| 版本 | 日期 | 变更摘要 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-03-16 | 初始版本，全量梳理 14 张表勾稽关系，记录 8 处已知问题 | Claude Code |

---

## 目录

1. [数据库总览](#数据库总览)
2. [实体关系图（文字版）](#实体关系图)
3. [各表详情](#各表详情)
4. [外键引用清单](#外键引用清单)
5. [软删除覆盖情况](#软删除覆盖情况)
6. [级联关系与孤儿数据风险](#级联关系与孤儿数据风险)
7. [Entity ↔ Schema 对齐差异](#entity--schema-对齐差异)
8. [已知问题与待办](#已知问题与待办)

---

## 数据库总览

- **数据库引擎**：MySQL 8.0，字符集 utf8mb4
- **ORM**：MyBatis Plus 3.x
  - 软删除全局字段：`deleted`，1=已删，0=正常
  - 主键策略：AUTO_INCREMENT
- **外键约束**：⚠️ 数据库层无 FOREIGN KEY 约束，所有引用完整性由应用层保证
- **schema 文件**：`backend/src/main/resources/schema.sql`
- **初始数据**：`backend/src/main/resources/init.sql`

---

## 实体关系图

```
institution (机构)
├── campus (校区)          institution_id → institution.id
│   ├── homework (作业)    campus_id → campus.id [NULLABLE]
│   └── income_stat        campus_id → campus.id [NULLABLE]
├── sys_user (用户)        institution_id → institution.id [NULLABLE]
│   ├── membership_order   user_id → sys_user.id
│   ├── user_membership    user_id → sys_user.id
│   ├── question (题目)    create_by → sys_user.id [NULLABLE]
│   ├── homework           creator_id → sys_user.id
│   ├── homework_submission student_id → sys_user.id
│   ├── study_record       user_id → sys_user.id
│   ├── content_report     reporter_id → sys_user.id
│   └── content_report     handler_id → sys_user.id [NULLABLE]
└── income_stat            institution_id → institution.id

book (绘本/教材)
└── study_record           book_id → book.id [NULLABLE]

membership_level (会员等级)
├── membership_order       level_id → membership_level.id
└── user_membership        level_id → membership_level.id

homework (作业)
└── homework_submission    homework_id → homework.id

institution_application (入驻申请)  ← 独立表，无父表引用
  reviewer_id → sys_user.id [NULLABLE]
```

---

## 各表详情

### 1. `sys_user` — 用户表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | 自增主键 |
| openid | VARCHAR(64) | Y | 微信 openid，unique |
| username | VARCHAR(50) | Y | 管理端账号 |
| password | VARCHAR(100) | Y | BCrypt 密文 |
| nickname | VARCHAR(50) | Y | 昵称 |
| phone | VARCHAR(20) | Y | 手机号 |
| role | VARCHAR(20) | N | student/parent/teacher/principal/head_principal/admin |
| status | TINYINT | N | 1=正常，0=禁用 |
| **institution_id** | BIGINT | Y | → institution.id；admin 用户为 NULL |
| deleted | TINYINT | N | MyBatis Plus 软删除 |

**软删除**：✅ 已实现（`@TableLogic`）
**Entity**：`User.java` ✅  **Mapper**：`UserMapper.java` ✅

---

### 2. `institution` — 机构表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| name | VARCHAR(100) | N | 机构名称 |
| logo | VARCHAR(255) | Y | |
| contact | VARCHAR(50) | Y | 联系人 |
| phone | VARCHAR(20) | Y | |
| address | VARCHAR(255) | Y | |
| status | TINYINT | N | 1=正常 |
| deleted | TINYINT | N | 软删除 |

**软删除**：✅ 已实现
**被引用**：`campus.institution_id`、`sys_user.institution_id`、`income_stat.institution_id`
**Entity**：`Institution.java` ✅  **Mapper**：`InstitutionMapper.java` ✅（v1.0 新增）

---

### 3. `campus` — 校区表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **institution_id** | BIGINT | N | → institution.id |
| name | VARCHAR(100) | N | |
| address | VARCHAR(255) | Y | |
| contact / phone | VARCHAR | Y | |
| student_count | INT | Y | 统计冗余字段 |
| teacher_count | INT | Y | 统计冗余字段 |
| status | TINYINT | N | 1=正常 |
| deleted | TINYINT | N | 软删除 |

**软删除**：✅ 已实现
**被引用**：`homework.campus_id`、`income_stat.campus_id`
**Entity**：`Campus.java` ✅  **Mapper**：`CampusMapper.java` ✅

---

### 4. `membership_level` — 会员等级表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| name | VARCHAR(50) | N | 等级名称 |
| level | INT | N | 等级序号，unique |
| price | DECIMAL(10,2) | N | ⚠️ Entity 中定义为 Integer，类型不匹配 |
| duration_days | INT | N | |
| features | TEXT | Y | JSON |
| status | TINYINT | N | |

**软删除**：❌ 无 deleted 字段（使用 status 代替，需代码处理）
**被引用**：`membership_order.level_id`、`user_membership.level_id`
**Entity**：`MembershipLevel.java` ✅  **Mapper**：`MembershipLevelMapper.java` ✅

---

### 5. `membership_order` — 会员订单表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| order_no | VARCHAR(64) | N | 订单号，unique |
| **user_id** | BIGINT | N | → sys_user.id |
| **level_id** | BIGINT | N | → membership_level.id |
| amount | DECIMAL(10,2) | N | |
| pay_type | VARCHAR(20) | Y | wechat/alipay |
| status | VARCHAR(20) | N | pending/success/failed/refunded |
| pay_time / expire_time | DATETIME | Y | |
| transaction_id | VARCHAR(64) | Y | 支付平台流水号 |

**软删除**：❌ 无（订单为业务凭证，不应物理/软删除）
**Entity**：`MembershipOrder.java` ✅  **Mapper**：`MembershipOrderMapper.java` ✅

---

### 6. `user_membership` — 用户会员状态表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **user_id** | BIGINT | N | → sys_user.id |
| **level_id** | BIGINT | N | → membership_level.id |
| start_time / expire_time | DATETIME | N | |
| status | TINYINT | N | 1=有效 |

**软删除**：❌ 无
**Entity**：`UserMembership.java` ✅  **Mapper**：`UserMembershipMapper.java` ✅

---

### 7. `book` — 绘本/教材表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| title / subtitle | VARCHAR | N/Y | |
| cover | VARCHAR(255) | Y | 封面图 URL |
| level / age_range | VARCHAR | Y | 难度/适龄 |
| rating | DECIMAL(3,1) | Y | |
| tags | VARCHAR(255) | Y | |
| page_count / duration / word_count | INT | Y | |
| description | TEXT | Y | |
| status | TINYINT | N | |

**软删除**：❌ 无
**被引用**：`study_record.book_id`
**Entity**：⚠️ **缺失** — `Book.java` 未创建
**Mapper**：⚠️ **缺失** — `BookMapper.java` 未创建

---

### 8. `question` — 题目表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| type | VARCHAR(30) | N | choice/fill/judge/voice/essay |
| content | TEXT | N | 题目正文（含选项） |
| answer | TEXT | Y | 答案 |
| difficulty | INT | Y | 1-5 |
| tags | VARCHAR(255) | Y | |
| **create_by** | BIGINT | Y | → sys_user.id |
| status | TINYINT | N | |
| ~~image_url~~ | — | — | ⚠️ Entity 有此字段，schema 无此列，需补 ALTER |
| ~~knowledge_point~~ | — | — | ⚠️ Entity 有此字段，schema 无此列，需补 ALTER |

**软删除**：❌ 无（用 status=0 代替）
**Entity**：`Question.java` ✅（含 imageUrl、knowledgePoint 字段待 schema 对齐）
**Mapper**：`QuestionMapper.java` ✅

---

### 9. `homework` — 作业表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| title | VARCHAR(100) | N | |
| description | TEXT | Y | |
| **creator_id** | BIGINT | N | → sys_user.id |
| **campus_id** | BIGINT | Y | → campus.id |
| class_ids | VARCHAR(255) | Y | JSON 数组（无独立班级表） |
| question_ids | TEXT | Y | JSON 数组（无中间表） |
| deadline | DATETIME | Y | |
| total_score | INT | Y | |
| status | VARCHAR(20) | N | draft/published/closed |

**软删除**：❌ 无
**被引用**：`homework_submission.homework_id`
**Entity**：`Homework.java` ✅  **Mapper**：`HomeworkMapper.java` ✅

> ⚠️ `class_ids` 和 `question_ids` 用 JSON 字符串存储关联 ID，无独立中间表，JOIN 查询无法使用索引。

---

### 10. `homework_submission` — 作业提交表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **homework_id** | BIGINT | N | → homework.id |
| **student_id** | BIGINT | N | → sys_user.id |
| answers | TEXT | Y | JSON |
| score | INT | Y | |
| ai_feedback / teacher_feedback | TEXT | Y | |
| submit_time / review_time | DATETIME | Y | |
| status | VARCHAR(20) | N | pending/submitted/reviewed |

**软删除**：❌ 无
**Entity**：`HomeworkSubmission.java` ✅  **Mapper**：`HomeworkSubmissionMapper.java` ✅

---

### 11. `study_record` — 学习记录表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **user_id** | BIGINT | N | → sys_user.id |
| **book_id** | BIGINT | Y | → book.id |
| type | VARCHAR(30) | N | reading/quiz/exercise |
| duration | INT | Y | 秒 |
| score | INT | Y | |

**软删除**：❌ 无
**Entity**：⚠️ **缺失** — `StudyRecord.java` 未创建
**Mapper**：⚠️ **缺失** — `StudyRecordMapper.java` 未创建

---

### 12. `income_stat` — 收入统计表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **institution_id** | BIGINT | N | → institution.id |
| **campus_id** | BIGINT | Y | → campus.id |
| date | DATE | N | 统计日期 |
| membership_income / book_income / other_income | DECIMAL | Y | |
| total_income | DECIMAL | Y | |
| new_students / active_students | INT | Y | |

**软删除**：❌ 无（统计数据不删除）
**唯一约束**：`(institution_id, campus_id, date)`
**Entity**：`IncomeStat.java` ✅  **Mapper**：`IncomeStatMapper.java` ✅

---

### 13. `institution_application` — 机构入驻申请表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| name / contact / phone / address | VARCHAR | N/Y | |
| remark | TEXT | Y | |
| status | VARCHAR(20) | N | pending/approved/rejected |
| **reviewer_id** | BIGINT | Y | → sys_user.id |
| review_time / review_note | DATETIME/VARCHAR | Y | |

**软删除**：❌ 无
**⚠️ 注意**：表已在数据库中存在，但 `schema.sql` 中无 CREATE TABLE 语句，需补全
**Entity**：`InstitutionApplication.java` ✅（v1.0 新增）  **Mapper**：`InstitutionApplicationMapper.java` ✅（v1.0 新增）

---

### 14. `content_report` — 内容举报表

| 列名 | 类型 | 可空 | 说明 |
|------|------|------|------|
| id | BIGINT PK | N | |
| **reporter_id** | BIGINT | N | → sys_user.id |
| content_type | VARCHAR(20) | N | question/book |
| content_id | BIGINT | N | 被举报内容 ID |
| reason | VARCHAR(255) | Y | |
| status | VARCHAR(20) | N | pending/handled/dismissed |
| **handler_id** | BIGINT | Y | → sys_user.id |
| handle_time / handle_note | DATETIME/VARCHAR | Y | |

**软删除**：❌ 无
**⚠️ 注意**：表已在数据库中存在，但 `schema.sql` 中无 CREATE TABLE 语句，需补全
**Entity**：`ContentReport.java` ✅（v1.0 新增）  **Mapper**：`ContentReportMapper.java` ✅（v1.0 新增）

---

## 外键引用清单

> 均为**应用层约束**，数据库无 FOREIGN KEY 定义。

| 子表.列 | → 父表.列 | 可空 | 级联处理 |
|---------|----------|------|---------|
| campus.institution_id | institution.id | N | ⚠️ 无级联，需应用层处理 |
| sys_user.institution_id | institution.id | Y | ⚠️ 无级联 |
| income_stat.institution_id | institution.id | N | ⚠️ 无级联 |
| income_stat.campus_id | campus.id | Y | ⚠️ 无级联 |
| membership_order.user_id | sys_user.id | N | 订单保留历史，不级联删 |
| membership_order.level_id | membership_level.id | N | ⚠️ 无级联 |
| user_membership.user_id | sys_user.id | N | ⚠️ 无级联 |
| user_membership.level_id | membership_level.id | N | ⚠️ 无级联 |
| question.create_by | sys_user.id | Y | 可为空，低风险 |
| homework.creator_id | sys_user.id | N | ⚠️ 无级联 |
| homework.campus_id | campus.id | Y | ⚠️ 无级联 |
| homework_submission.homework_id | homework.id | N | ⚠️ 无级联 |
| homework_submission.student_id | sys_user.id | N | ⚠️ 无级联 |
| study_record.user_id | sys_user.id | N | ⚠️ 无级联 |
| study_record.book_id | book.id | Y | 可为空，低风险 |
| institution_application.reviewer_id | sys_user.id | Y | 可为空，低风险 |
| content_report.reporter_id | sys_user.id | N | ⚠️ 无级联 |
| content_report.handler_id | sys_user.id | Y | 可为空，低风险 |

---

## 软删除覆盖情况

| 表名 | 软删除字段 | MyBatis Plus @TableLogic | 备注 |
|------|-----------|--------------------------|------|
| sys_user | `deleted` | ✅ | |
| institution | `deleted` | ✅ | |
| campus | `deleted` | ✅ | |
| membership_level | 无 | ❌ | 用 status=0 代替，需手动过滤 |
| membership_order | 无 | ❌ | 订单不删除，status 流转 |
| user_membership | 无 | ❌ | 用 status=0 代替 |
| book | 无 | ❌ | 用 status=0 代替 |
| question | 无 | ❌ | 用 status=0 代替 |
| homework | 无 | ❌ | 用 status 流转 |
| homework_submission | 无 | ❌ | 用 status 流转 |
| study_record | 无 | ❌ | 只追加，不删除 |
| income_stat | 无 | ❌ | 统计数据，不删除 |
| institution_application | 无 | ❌ | 用 status 流转 |
| content_report | 无 | ❌ | 用 status 流转 |

**结论**：只有核心身份表（user/institution/campus）使用 deleted 字段软删除；其余表用 status 字段表达生命周期，这是**有意为之的设计选择**，但需在查询时注意每类表的过滤条件不同。

---

## 级联关系与孤儿数据风险

### 🔴 高风险场景

**场景 1：删除机构（institution）**
```
institution (deleted=1)
  ├── campus.institution_id — ⚠️ 孤儿校区，查询时被 institution 软删除过滤但 campus 仍可见
  ├── sys_user.institution_id — ⚠️ 孤儿用户，仍可登录
  └── income_stat.institution_id — ⚠️ 收入数据引用失效
```
**处理规范**：删除机构时，Service 层必须先将关联 campus、sys_user 置为 deleted/status=0。

**场景 2：删除校区（campus）**
```
campus (deleted=1)
  ├── homework.campus_id — ⚠️ 孤儿作业，CampusServiceImpl 当前未处理
  └── income_stat.campus_id — ⚠️ 统计数据引用失效
```
**处理规范**：删除校区时，Service 层必须将该校区下所有 homework 关闭（status=closed）。

**场景 3：删除用户（sys_user）**
```
sys_user (deleted=1)
  ├── membership_order.user_id — 保留（订单是业务凭证，不级联）
  ├── user_membership.user_id — 应同步 status=0
  ├── homework_submission.student_id — 保留历史
  └── question.create_by — 字段可空，保留内容
```

### 🟡 中风险场景

**场景 4：homework.question_ids / class_ids 存 JSON**
question_ids 和 class_ids 以 JSON 字符串存储，删题目/班级时无法通过索引快速找到引用该 ID 的作业，需全表扫描。
**处理规范**：删题目前需应用层检查是否有作业引用（全量扫描 question_ids 字段）。

---

## Entity ↔ Schema 对齐差异

### ❗ 需要修复的差异

| 严重度 | 表 | 问题 | 修复方案 |
|--------|-----|------|---------|
| 🔴 高 | question | Entity 含 `image_url`、`knowledge_point` 字段，schema 无对应列 | 在 schema.sql 补 ALTER TABLE |
| 🔴 高 | institution_application | Entity/Mapper 已存在，schema.sql 无 CREATE TABLE | 在 schema.sql 补 CREATE TABLE |
| 🔴 高 | content_report | 同上 | 同上 |
| 🔴 高 | book | schema 有表，Entity/Mapper 缺失 | 创建 Book.java、BookMapper.java |
| 🔴 高 | study_record | schema 有表，Entity/Mapper 缺失 | 创建 StudyRecord.java、StudyRecordMapper.java |
| 🟡 中 | membership_level | Entity.price 为 Integer，schema 为 DECIMAL(10,2) | Entity 改为 BigDecimal |

### ✅ 已对齐的表

sys_user、institution、campus、membership_order、user_membership、homework、homework_submission、income_stat

---

## 已知问题与待办

| # | 优先级 | 类型 | 问题描述 | 负责人 | 状态 |
|---|--------|------|---------|--------|------|
| 1 | P0 | Schema 缺失 | `question` 表缺 `image_url`、`knowledge_point` 列 | — | ⏳ 待修复 |
| 2 | P0 | Schema 缺失 | `institution_application`、`content_report` 未在 schema.sql 定义 | — | ⏳ 待修复 |
| 3 | P0 | Entity 缺失 | `Book.java`、`StudyRecord.java` 及对应 Mapper 未创建 | — | ⏳ 待修复 |
| 4 | P1 | 级联缺失 | 删机构未级联处理 campus/sys_user | — | ⏳ 待实现 |
| 5 | P1 | 级联缺失 | 删校区未级联处理 homework | — | ⏳ 待实现 |
| 6 | P2 | 类型不匹配 | `MembershipLevel.price` 应为 BigDecimal | — | ⏳ 待修复 |
| 7 | P2 | 设计限制 | homework.question_ids 存 JSON，无索引，大数据量时性能差 | — | 📋 记录，后续优化 |
| 8 | P3 | 软删除 | 11 张表无 @TableLogic，用 status 代替，需文档化查询规范 | — | 📋 已记录 |

---

## 维护指南

### 新增表时
1. 在 `schema.sql` 添加 `CREATE TABLE IF NOT EXISTS`
2. 创建 `entity/Xxx.java`（含 `@TableName`、`@TableId`、`@TableLogic` 按需）
3. 创建 `mapper/XxxMapper.java`（继承 `BaseMapper<Xxx>`）
4. 在本文档 [各表详情](#各表详情) 章节新增该表描述
5. 在 [外键引用清单](#外键引用清单) 补充新增的外键关系
6. 在 [版本历史](#版本历史) 追加一行记录

### 变更表结构时
1. 在 `schema.sql` 添加注释版 `ALTER TABLE`（不删旧列定义，追加到文件末尾）
2. 同步更新 Entity 字段
3. 更新本文档对应表的列说明
4. 更新 [版本历史](#版本历史)

### 删除表时
1. 注释掉（不删除）`schema.sql` 中的 CREATE TABLE
2. 保留 Entity/Mapper 文件，加 `@Deprecated` 注解
3. 本文档标注 `[已废弃 vX.X]`
4. 更新 [版本历史](#版本历史)
