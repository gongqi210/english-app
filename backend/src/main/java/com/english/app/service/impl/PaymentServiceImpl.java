package com.english.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.PaymentRequest;
import com.english.app.dto.PaymentResult;
import com.english.app.entity.MembershipLevel;
import com.english.app.entity.MembershipOrder;
import com.english.app.entity.UserMembership;
import com.english.app.mapper.MembershipLevelMapper;
import com.english.app.mapper.MembershipOrderMapper;
import com.english.app.mapper.UserMembershipMapper;
import com.english.app.service.JwtService;
import com.english.app.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final MembershipOrderMapper orderMapper;
    private final UserMembershipMapper userMembershipMapper;
    private final MembershipLevelMapper levelMapper;
    private final JwtService jwtService;

    @Value("${wechat.appId:}")
    private String appId;

    @Override
    public PaymentResult createPayment(PaymentRequest request) {
        // 查询订单
        MembershipOrder order = orderMapper.selectOne(
            new LambdaQueryWrapper<MembershipOrder>()
                .eq(MembershipOrder::getOrderNo, request.getOrderNo())
        );

        if (order == null) {
            throw new RuntimeException("订单不存在");
        }

        // TODO: 实际调用微信支付API创建预付单
        // 这里返回模拟的支付参数
        PaymentResult result = new PaymentResult();
        result.setOrderNo(order.getOrderNo());
        result.setStatus("pending");

        // 模拟返回小程序支付参数
        result.setPayUrl("weixin://wxpay/bizpayurl?pr=mock_" + order.getOrderNo());
        result.setTimestamp(System.currentTimeMillis());

        return result;
    }

    @Override
    public String handleNotify(String xmlData) {
        log.info("收到微信支付回调: {}", xmlData);

        // TODO: 实际需要解析XML，验签，处理回调
        // 模拟处理成功
        String orderNo = extractOrderNo(xmlData);

        if (orderNo != null) {
            MembershipOrder order = orderMapper.selectOne(
                new LambdaQueryWrapper<MembershipOrder>()
                    .eq(MembershipOrder::getOrderNo, orderNo)
            );

            if (order != null && "pending".equals(order.getStatus())) {
                // 更新订单状态
                order.setStatus("success");
                order.setPayTime(LocalDateTime.now());
                orderMapper.updateById(order);

                // 开通会员
                activateMembership(order);
            }
        }

        return "<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>";
    }

    @Override
    public PaymentResult getPaymentStatus(String orderNo) {
        MembershipOrder order = orderMapper.selectOne(
            new LambdaQueryWrapper<MembershipOrder>()
                .eq(MembershipOrder::getOrderNo, orderNo)
        );

        PaymentResult result = new PaymentResult();
        result.setOrderNo(orderNo);
        result.setStatus(order != null ? order.getStatus() : "not_found");
        return result;
    }

    private void activateMembership(MembershipOrder order) {
        // 获取会员等级信息
        MembershipLevel level = levelMapper.selectById(order.getLevelId());

        // 计算会员到期时间
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireTime = now.plusDays(level.getDurationDays());

        // 检查是否已有会员
        UserMembership existing = userMembershipMapper.selectOne(
            new LambdaQueryWrapper<UserMembership>()
                .eq(UserMembership::getUserId, order.getUserId())
                .eq(UserMembership::getStatus, 1)
        );

        if (existing != null) {
            // 续期：从当前到期时间开始计算
            if (existing.getExpireTime().isAfter(now)) {
                expireTime = existing.getExpireTime().plusDays(level.getDurationDays());
            }
            existing.setExpireTime(expireTime);
            userMembershipMapper.updateById(existing);
        } else {
            // 新开会员
            UserMembership membership = new UserMembership();
            membership.setUserId(order.getUserId());
            membership.setLevelId(order.getLevelId());
            membership.setStartTime(now);
            membership.setExpireTime(expireTime);
            membership.setStatus(1);
            userMembershipMapper.insert(membership);
        }
    }

    private String extractOrderNo(String xmlData) {
        // TODO: 实际需要解析XML
        // 简单模拟
        if (xmlData.contains("MEM")) {
            int start = xmlData.indexOf("MEM");
            return xmlData.substring(start, start + 20);
        }
        return null;
    }
}
