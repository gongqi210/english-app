package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.MembershipLevelDTO;
import com.english.app.dto.CreateOrderRequest;
import com.english.app.dto.OrderDTO;
import com.english.app.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    /**
     * 获取会员等级列表
     */
    @GetMapping("/levels")
    public Result<List<MembershipLevelDTO>> getLevels() {
        return Result.success(membershipService.getLevels());
    }

    /**
     * 获取当前用户会员状态
     */
    @GetMapping("/status")
    public Result<MembershipLevelDTO> getMyStatus() {
        return Result.success(membershipService.getMyMembership());
    }

    /**
     * 创建订单
     */
    @PostMapping("/order")
    public Result<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return Result.success(membershipService.createOrder(request));
    }

    /**
     * 订单列表
     */
    @GetMapping("/orders")
    public Result<List<OrderDTO>> getOrders() {
        return Result.success(membershipService.getMyOrders());
    }
}
