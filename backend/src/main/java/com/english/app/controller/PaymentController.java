package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.PaymentRequest;
import com.english.app.dto.PaymentResult;
import com.english.app.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 发起支付
     */
    @PostMapping("/pay")
    public Result<PaymentResult> pay(@RequestBody PaymentRequest request) {
        return Result.success(paymentService.createPayment(request));
    }

    /**
     * 微信支付回调
     */
    @PostMapping("/notify")
    public String notify(@RequestBody String xmlData) {
        return paymentService.handleNotify(xmlData);
    }

    /**
     * 查询支付状态
     */
    @GetMapping("/status/{orderNo}")
    public Result<PaymentResult> getStatus(@PathVariable String orderNo) {
        return Result.success(paymentService.getPaymentStatus(orderNo));
    }
}
