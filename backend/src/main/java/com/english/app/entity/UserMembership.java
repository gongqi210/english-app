package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_membership")
public class UserMembership {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;
    private Long levelId;
    private LocalDateTime startTime;
    private LocalDateTime expireTime;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
