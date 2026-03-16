package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("content_report")
public class ContentReport {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long reporterId;
    private String contentType;
    private Long contentId;
    private String reason;

    private String status; // pending / handled / dismissed

    private Long handlerId;
    private LocalDateTime handleTime;
    private String handleNote;

    private LocalDateTime createTime;
}
