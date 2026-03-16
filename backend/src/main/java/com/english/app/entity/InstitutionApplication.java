package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("institution_application")
public class InstitutionApplication {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String contact;
    private String phone;
    private String address;
    private String remark;

    private String status; // pending / approved / rejected

    private Long reviewerId;
    private LocalDateTime reviewTime;
    private String reviewNote;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
