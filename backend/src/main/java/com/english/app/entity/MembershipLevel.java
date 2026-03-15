package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("membership_level")
public class MembershipLevel {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private Integer level;
    private Integer price;
    private Integer durationDays;
    private String features;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
