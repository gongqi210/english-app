package com.english.app.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.LoginResponse;
import com.english.app.entity.User;
import com.english.app.entity.UserMembership;
import com.english.app.mapper.UserMapper;
import com.english.app.mapper.UserMembershipMapper;
import com.english.app.service.AuthService;
import com.english.app.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final UserMembershipMapper userMembershipMapper;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(String code, String role) {
        // TODO: 实际应该调用微信API获取openid
        // 这里模拟：使用code作为openid
        String openid = "mock_" + code;

        // 查询用户是否存在
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>()
                .eq(User::getOpenid, openid)
        );

        if (user == null) {
            // 创建新用户
            user = new User();
            user.setOpenid(openid);
            user.setNickname("用户" + IdUtil.fastSimpleUUID().substring(0, 6));
            user.setRole(role != null && !role.isEmpty() ? role : "student");
            user.setStatus(1);
            userMapper.insert(user);
        }

        // 生成token
        String token = jwtService.generateToken(user.getId());

        // 构建返回
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setToken(token);
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setInstitutionId(user.getInstitutionId());

        // 查询会员状态
        UserMembership membership = userMembershipMapper.selectOne(
            new LambdaQueryWrapper<UserMembership>()
                .eq(UserMembership::getUserId, user.getId())
                .eq(UserMembership::getStatus, 1)
                .gt(UserMembership::getExpireTime, LocalDateTime.now())
        );

        if (membership != null) {
            response.setMembershipLevel(membership.getLevelId().intValue());
            response.setIsVip(true);
        } else {
            response.setMembershipLevel(0);
            response.setIsVip(false);
        }

        return response;
    }

    @Override
    public LoginResponse adminLogin(String username, String password) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)
                .or()
                .eq(User::getPhone, username)
        );

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtService.generateToken(user.getId());

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setToken(token);
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setInstitutionId(user.getInstitutionId());
        response.setMembershipLevel(0);
        response.setIsVip(false);
        return response;
    }

    @Override
    public LoginResponse getCurrentUser() {
        Long userId = jwtService.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("未登录");
        }
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在，请重新登录");
        }

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setInstitutionId(user.getInstitutionId());

        return response;
    }

    @Override
    public void logout() {
        // 可以将token加入黑名单
    }
}
