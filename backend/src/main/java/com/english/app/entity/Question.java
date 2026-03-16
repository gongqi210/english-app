package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String type;
    private String content;
    private String answer;
    private String imageUrl;
    private String knowledgePoint;
    private Integer difficulty;
    private String tags;
    private Long createBy;

    @TableField("status")
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
