package com.english.app.service;

import com.english.app.dto.CreateOrderRequest;
import com.english.app.dto.MembershipLevelDTO;
import com.english.app.dto.OrderDTO;

import java.util.List;

public interface MembershipService {
    /**
     * 获取会员等级列表
     */
    List<MembershipLevelDTO> getLevels();

    /**
     * 获取当前用户会员状态
     */
    MembershipLevelDTO getMyMembership();

    /**
     * 创建订单
     */
    OrderDTO createOrder(CreateOrderRequest request);

    /**
     * 获取用户订单列表
     */
    List<OrderDTO> getMyOrders();
}
