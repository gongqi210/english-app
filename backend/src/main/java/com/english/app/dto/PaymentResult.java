package com.english.app.dto;

import lombok.Data;

@Data
public class PaymentResult {
    private String orderNo;
    private String payUrl; // 支付跳转URL或小程序支付参数
    private String status;
    private Long timestamp;
}
