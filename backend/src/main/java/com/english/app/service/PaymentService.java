package com.english.app.service;

import com.english.app.dto.PaymentRequest;
import com.english.app.dto.PaymentResult;

public interface PaymentService {
    /**
     * 创建支付
     */
    PaymentResult createPayment(PaymentRequest request);

    /**
     * 处理支付回调
     */
    String handleNotify(String xmlData);

    /**
     * 查询支付状态
     */
    PaymentResult getPaymentStatus(String orderNo);
}
