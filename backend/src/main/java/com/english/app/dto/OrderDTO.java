package com.english.app.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private Long id;
    private String orderNo;
    private Long levelId;
    private String levelName;
    private Integer amount;
    private String status;
    private LocalDateTime payTime;
    private LocalDateTime createTime;
}
