-- =============================================
-- 我AI学英语 - 数据库初始化脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS english_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE english_app;

-- =============================================
-- 表结构
-- =============================================

-- 用户表
CREATE TABLE IF NOT EXISTS `sys_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `openid` VARCHAR(64) DEFAULT NULL COMMENT '微信openid',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `password` VARCHAR(100) DEFAULT NULL COMMENT '密码',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `role` VARCHAR(20) NOT NULL COMMENT '角色: student/parent/teacher/principal',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1正常',
    `institution_id` BIGINT DEFAULT NULL COMMENT '机构ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '删除标记',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_openid` (`openid`),
    KEY `idx_role` (`role`),
    KEY `idx_institution_id` (`institution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 机构表
CREATE TABLE IF NOT EXISTS `institution` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '机构ID',
    `name` VARCHAR(100) NOT NULL COMMENT '机构名称',
    `logo` VARCHAR(255) DEFAULT NULL COMMENT 'logo',
    `contact` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1正常',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '删除标记',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机构表';

-- 校区表
CREATE TABLE IF NOT EXISTS `campus` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '校区ID',
    `institution_id` BIGINT NOT NULL COMMENT '机构ID',
    `name` VARCHAR(100) NOT NULL COMMENT '校区名称',
    `address` VARCHAR(255) DEFAULT NULL COMMENT '地址',
    `contact` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `student_count` INT DEFAULT 0 COMMENT '学生数量',
    `teacher_count` INT DEFAULT 0 COMMENT '老师数量',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1正常',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '删除标记',
    PRIMARY KEY (`id`),
    KEY `idx_institution_id` (`institution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校区表';

-- 会员等级表
CREATE TABLE IF NOT EXISTS `membership_level` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '等级ID',
    `name` VARCHAR(50) NOT NULL COMMENT '等级名称',
    `level` INT NOT NULL COMMENT '等级值',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格(分)',
    `duration_days` INT NOT NULL COMMENT '有效期(天)',
    `features` TEXT COMMENT '权益说明(JSON)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级表';

-- 会员订单表
CREATE TABLE IF NOT EXISTS `membership_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `level_id` BIGINT NOT NULL COMMENT '会员等级ID',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额(分)',
    `pay_type` VARCHAR(20) DEFAULT 'wechat' COMMENT '支付方式',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/success/failed/refunded',
    `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
    `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间',
    `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '微信交易号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员订单表';

-- 用户会员表
CREATE TABLE IF NOT EXISTS `user_membership` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `level_id` BIGINT NOT NULL COMMENT '会员等级ID',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `expire_time` DATETIME NOT NULL COMMENT '过期时间',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0过期 1有效',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户会员表';

-- 绘本表
CREATE TABLE IF NOT EXISTS `book` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '绘本ID',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `subtitle` VARCHAR(100) DEFAULT NULL COMMENT '副标题',
    `cover` VARCHAR(255) DEFAULT NULL COMMENT '封面',
    `level` VARCHAR(10) DEFAULT NULL COMMENT '难度等级',
    `age_range` VARCHAR(20) DEFAULT NULL COMMENT '适合年龄',
    `rating` DECIMAL(3,1) DEFAULT NULL COMMENT '评分',
    `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签(逗号分隔)',
    `page_count` INT DEFAULT 0 COMMENT '页数',
    `duration` INT DEFAULT 0 COMMENT '阅读时长(分钟)',
    `word_count` INT DEFAULT 0 COMMENT '单词数',
    `description` TEXT COMMENT '描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绘本表';

-- 初始化绘本数据
INSERT INTO `book` (`title`, `subtitle`, `cover`, `level`, `age_range`, `rating`, `tags`, `page_count`, `duration`, `word_count`, `description`, `status`) VALUES
('The Little Red Hen', '小红母鸡', 'https://picsum.photos/200/300?random=1', 'A', '3-6', 4.8, '经典童话,动手能力', 16, 5, 120, '一只勤劳的小红母鸡种小麦、烤面包的故事，培养孩子的勤劳品质', 1),
('Brown Bear Brown Bear', '棕熊棕熊', 'https://picsum.photos/200/300?random=2', 'A', '2-5', 4.9, '动物,颜色,重复句式', 12, 4, 80, '经典英文绘本，通过重复的句式帮助孩子认识颜色和动物', 1),
('The Very Hungry Caterpillar', '饥饿的毛毛虫', 'https://picsum.photos/200/300?random=3', 'B', '3-7', 4.9, '数字,食物,生命教育', 20, 6, 150, '一只小毛毛虫变成蝴蝶的故事，教会孩子数字和生命科学', 1),
('Pat the Bunny', '拍拍小兔子', 'https://picsum.photos/200/300?random=4', 'A', '0-3', 4.7, '感官,互动,亲子', 10, 3, 50, '适合0-3岁宝宝的触感书，培养触觉和亲子互动', 1),
('Good Night Moon', '晚安月亮', 'https://picsum.photos/200/300?random=5', 'B', '2-5', 4.8, ' bedtime,睡前,安静', 20, 5, 100, '经典的睡前绘本，帮助孩子建立良好的睡眠习惯', 1),
('Where is Wally', '找沃利', 'https://picsum.photos/200/300?random=6', 'C', '5-10', 4.6, '观察力,益智,冒险', 30, 15, 200, '在复杂的画面中寻找沃利，培养孩子的观察力', 1),
('Charlotte Web', '夏洛特的网', 'https://picsum.photos/200/300?random=7', 'D', '8-12', 4.9, '友谊,生命,成长', 50, 30, 800, '关于小猪威尔伯和蜘蛛夏洛特感人故事', 1),
('Harry Potter', '哈利波特', 'https://picsum.photos/200/300?random=8', 'E', '10+', 4.9, '魔法,冒险,奇幻', 200, 120, 5000, '风靡全球的魔法冒险故事', 1);

-- 题库表
CREATE TABLE IF NOT EXISTS `question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '题目ID',
    `type` VARCHAR(30) NOT NULL COMMENT '类型: choice/fill_blank/listening/tracing/reading/matching',
    `content` TEXT NOT NULL COMMENT '题目内容(JSON)',
    `answer` TEXT COMMENT '答案(JSON)',
    `difficulty` INT DEFAULT 1 COMMENT '难度1-5',
    `tags` VARCHAR(255) DEFAULT NULL COMMENT '标签',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_type` (`type`),
    KEY `idx_create_by` (`create_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题库表';

-- 作业表
CREATE TABLE IF NOT EXISTS `homework` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '作业ID',
    `title` VARCHAR(100) NOT NULL COMMENT '作业标题',
    `description` TEXT COMMENT '描述',
    `creator_id` BIGINT NOT NULL COMMENT '创建人ID',
    `campus_id` BIGINT DEFAULT NULL COMMENT '校区ID',
    `class_ids` VARCHAR(255) DEFAULT NULL COMMENT '班级ID列表',
    `question_ids` TEXT COMMENT '题目ID列表(JSON)',
    `deadline` DATETIME DEFAULT NULL COMMENT '截止时间',
    `total_score` INT DEFAULT 100 COMMENT '总分',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '状态: draft/published/closed',
    `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_creator_id` (`creator_id`),
    KEY `idx_campus_id` (`campus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';

-- 作业提交表
CREATE TABLE IF NOT EXISTS `homework_submission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提交ID',
    `homework_id` BIGINT NOT NULL COMMENT '作业ID',
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `answers` TEXT COMMENT '答案(JSON)',
    `score` INT DEFAULT NULL COMMENT '得分',
    `ai_feedback` TEXT COMMENT 'AI反馈',
    `teacher_feedback` TEXT COMMENT '老师反馈',
    `submit_time` DATETIME DEFAULT NULL COMMENT '提交时间',
    `review_time` DATETIME DEFAULT NULL COMMENT '批改时间',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/submitted/reviewed',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_homework_student` (`homework_id`, `student_id`),
    KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业提交表';

-- 学习记录表
CREATE TABLE IF NOT EXISTS `study_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `book_id` BIGINT DEFAULT NULL COMMENT '绘本ID',
    `type` VARCHAR(30) NOT NULL COMMENT '类型: read/quiz/homework',
    `duration` INT DEFAULT 0 COMMENT '时长(秒)',
    `score` INT DEFAULT NULL COMMENT '得分',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_book_id` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表';

-- 收入统计表
CREATE TABLE IF NOT EXISTS `income_stat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `institution_id` BIGINT NOT NULL COMMENT '机构ID',
    `campus_id` BIGINT DEFAULT NULL COMMENT '校区ID',
    `date` DATE NOT NULL COMMENT '日期',
    `membership_income` DECIMAL(10,2) DEFAULT 0 COMMENT '会员收入',
    `book_income` DECIMAL(10,2) DEFAULT 0 COMMENT '绘本收入',
    `other_income` DECIMAL(10,2) DEFAULT 0 COMMENT '其他收入',
    `total_income` DECIMAL(10,2) DEFAULT 0 COMMENT '总收入',
    `new_students` INT DEFAULT 0 COMMENT '新增学生',
    `active_students` INT DEFAULT 0 COMMENT '活跃学生',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_date_campus` (`institution_id`, `campus_id`, `date`),
    KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收入统计表';

-- =============================================
-- 初始化数据
-- =============================================

INSERT INTO `membership_level` (`name`, `level`, `price`, `duration_days`, `features`, `status`) VALUES
('免费版', 0, 0, 0, '["基础绘本阅读", "每日1本", "基础AI评分"]', 1),
('基础会员', 1, 2900, 30, '["全部绘本无限阅读", "AI评分无限次", "作业无限", "学习报告"]', 1),
('高级会员', 2, 5900, 30, '["基础会员全部权益", "1对1外教体验", "专属学习规划", "家长陪练指导", "优先客服"]', 1);

-- 初始化一个测试机构
INSERT INTO `institution` (`name`, `contact`, `phone`, `status`) VALUES
('测试英语培训机构', '张老师', '13800138000', 1);

-- 初始化一个测试校区
INSERT INTO `campus` (`institution_id`, `name`, `address`, `contact`, `phone`, `student_count`, `teacher_count`, `status`) VALUES
(1, '总校区', '北京市朝阳区测试路1号', '张老师', '13800138000', 100, 10, 1);

-- 初始化测试用户 (密码: 123456)
INSERT INTO `sys_user` (`openid`, `nickname`, `role`, `institution_id`, `status`) VALUES
('test_student_001', '小明', 'student', 1, 1),
('test_parent_001', '小明妈妈', 'parent', 1, 1),
('test_teacher_001', '李老师', 'teacher', 1, 1),
('test_principal_001', '王校长', 'principal', 1, 1);
