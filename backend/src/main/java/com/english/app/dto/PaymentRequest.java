package com.english.app.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String orderNo;
    private Integer amount;
    private String payType; // wechat
}
