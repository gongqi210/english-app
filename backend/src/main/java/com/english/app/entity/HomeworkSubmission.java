package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("homework_submission")
public class HomeworkSubmission {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long homeworkId;
    private Long studentId;
    private String answers;
    private Integer score;
    private String aiFeedback;
    private String teacherFeedback;
    private LocalDateTime submitTime;
    private LocalDateTime reviewTime;
    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
