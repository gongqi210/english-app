package com.english.app.service.impl;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.CreateOrderRequest;
import com.english.app.dto.MembershipLevelDTO;
import com.english.app.dto.OrderDTO;
import com.english.app.entity.MembershipLevel;
import com.english.app.entity.MembershipOrder;
import com.english.app.entity.UserMembership;
import com.english.app.mapper.MembershipLevelMapper;
import com.english.app.mapper.MembershipOrderMapper;
import com.english.app.mapper.UserMembershipMapper;
import com.english.app.service.JwtService;
import com.english.app.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final MembershipLevelMapper levelMapper;
    private final MembershipOrderMapper orderMapper;
    private final UserMembershipMapper userMembershipMapper;
    private final JwtService jwtService;

    @Override
    public List<MembershipLevelDTO> getLevels() {
        List<MembershipLevel> levels = levelMapper.selectList(
            new LambdaQueryWrapper<MembershipLevel>()
                .eq(MembershipLevel::getStatus, 1)
                .orderByAsc(MembershipLevel::getLevel)
        );

        Long userId = jwtService.getCurrentUserId();
        Integer currentLevel = getCurrentUserLevel(userId);

        return levels.stream().map(level -> {
            MembershipLevelDTO dto = new MembershipLevelDTO();
            dto.setId(level.getId());
            dto.setName(level.getName());
            dto.setLevel(level.getLevel());
            dto.setPrice(level.getPrice());
            dto.setDurationDays(level.getDurationDays());
            dto.setFeatures(JSONUtil.toArray(level.getFeatures(), String.class));
            dto.setIsCurrent(level.getLevel().equals(currentLevel));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public MembershipLevelDTO getMyMembership() {
        Long userId = jwtService.getCurrentUserId();
        UserMembership membership = userMembershipMapper.selectOne(
            new LambdaQueryWrapper<UserMembership>()
                .eq(UserMembership::getUserId, userId)
                .eq(UserMembership::getStatus, 1)
                .gt(UserMembership::getExpireTime, LocalDateTime.now())
        );

        if (membership == null) {
            MembershipLevelDTO dto = new MembershipLevelDTO();
            dto.setLevel(0);
            dto.setName("免费版");
            return dto;
        }

        MembershipLevel level = levelMapper.selectById(membership.getLevelId());
        MembershipLevelDTO dto = new MembershipLevelDTO();
        dto.setId(level.getId());
        dto.setName(level.getName());
        dto.setLevel(level.getLevel());
        dto.setIsCurrent(true);
        return dto;
    }

    @Override
    public OrderDTO createOrder(CreateOrderRequest request) {
        Long userId = jwtService.getCurrentUserId();

        MembershipLevel level = levelMapper.selectById(request.getLevelId());

        MembershipOrder order = new MembershipOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setLevelId(request.getLevelId());
        order.setAmount(level.getPrice().multiply(java.math.BigDecimal.valueOf(100)));
        order.setStatus("pending");
        orderMapper.insert(order);

        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNo(order.getOrderNo());
        dto.setLevelId(level.getId());
        dto.setLevelName(level.getName());
        dto.setAmount(level.getPrice());
        dto.setStatus(order.getStatus());
        dto.setCreateTime(order.getCreateTime());
        return dto;
    }

    @Override
    public List<OrderDTO> getMyOrders() {
        Long userId = jwtService.getCurrentUserId();
        List<MembershipOrder> orders = orderMapper.selectList(
            new LambdaQueryWrapper<MembershipOrder>()
                .eq(MembershipOrder::getUserId, userId)
                .orderByDesc(MembershipOrder::getCreateTime)
        );

        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setId(order.getId());
            dto.setOrderNo(order.getOrderNo());
            dto.setLevelId(order.getLevelId());
            dto.setAmount(order.getAmount().intValue());
            dto.setStatus(order.getStatus());
            dto.setPayTime(order.getPayTime());
            dto.setCreateTime(order.getCreateTime());
            return dto;
        }).collect(Collectors.toList());
    }

    private Integer getCurrentUserLevel(Long userId) {
        UserMembership membership = userMembershipMapper.selectOne(
            new LambdaQueryWrapper<UserMembership>()
                .eq(UserMembership::getUserId, userId)
                .eq(UserMembership::getStatus, 1)
                .gt(UserMembership::getExpireTime, LocalDateTime.now())
        );
        return membership != null ? membership.getLevelId().intValue() : 0;
    }

    private String generateOrderNo() {
        return "MEM" + System.currentTimeMillis();
    }
}
