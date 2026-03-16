package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("homework")
public class Homework {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;
    private String description;
    private Long creatorId;
    private Long campusId;
    private String classIds;
    private String questionIds;
    private LocalDateTime deadline;
    private Integer totalScore;
    private String status;
    private LocalDateTime publishTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
