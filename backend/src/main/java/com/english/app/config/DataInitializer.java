package com.english.app.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.entity.User;
import com.english.app.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 启动时创建测试账号（仅当账号不存在时）
 * 账号密码：admin/admin123, teacher/teacher123, principal/principal123
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        createIfAbsent("admin",     "admin123",     "admin",          "运营管理员");
        createIfAbsent("teacher1",  "teacher123",   "teacher",        "测试老师");
        createIfAbsent("principal1","principal123",  "principal",      "测试分校长");
        createIfAbsent("hprincipal","hprincipal123", "head_principal", "测试总校长");
    }

    private void createIfAbsent(String username, String rawPassword, String role, String nickname) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (count > 0) return;

        User user = new User();
        user.setUsername(username);
        user.setPhone(username);          // phone 也设为 username 方便用手机号登录
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setNickname(nickname);
        user.setRole(role);
        user.setStatus(1);
        userMapper.insert(user);
        log.info("Created test account: {} / {} ({})", username, rawPassword, role);
    }
}
