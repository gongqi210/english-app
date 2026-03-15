package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("campus")
public class Campus {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long institutionId;
    private String name;
    private String address;
    private String contact;
    private String phone;
    private Integer studentCount;
    private Integer teacherCount;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
