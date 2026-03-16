package com.english.app.service;

import com.english.app.dto.LoginResponse;
import com.english.app.entity.User;
import com.english.app.mapper.UserMapper;
import com.english.app.mapper.UserMembershipMapper;
import com.english.app.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserMapper userMapper;
    @Mock UserMembershipMapper userMembershipMapper;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AuthServiceImpl authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setOpenid("mock_testcode");
        existingUser.setNickname("小明");
        existingUser.setRole("student");
        existingUser.setStatus(1);
    }

    @Test
    @DisplayName("微信登录 - 已有用户直接返回")
    void login_existingUser() {
        when(userMapper.selectOne(any())).thenReturn(existingUser);
        when(jwtService.generateToken(1L)).thenReturn("token-abc");
        when(userMembershipMapper.selectOne(any())).thenReturn(null);

        LoginResponse resp = authService.login("testcode", "student");

        assertThat(resp.getToken()).isEqualTo("token-abc");
        assertThat(resp.getRole()).isEqualTo("student");
        assertThat(resp.getNickname()).isEqualTo("小明");
        verify(userMapper, never()).insert(any());
    }

    @Test
    @DisplayName("微信登录 - 新用户自动创建，role 默认 student")
    void login_newUser_defaultRole() {
        when(userMapper.selectOne(any())).thenReturn(null);
        when(jwtService.generateToken(any())).thenReturn("new-token");
        when(userMembershipMapper.selectOne(any())).thenReturn(null);

        // role 传 null 时应默认设为 student
        authService.login("brandnew", null);

        verify(userMapper).insert(argThat(u -> "student".equals(u.getRole())));
    }

    @Test
    @DisplayName("管理员登录 - 用户不存在抛异常")
    void adminLogin_userNotFound() {
        when(userMapper.selectOne(any())).thenReturn(null);

        assertThatThrownBy(() -> authService.adminLogin("nobody", "pass"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("用户不存在");
    }

    @Test
    @DisplayName("管理员登录 - 账号禁用抛异常")
    void adminLogin_accountBanned() {
        existingUser.setStatus(0);
        when(userMapper.selectOne(any())).thenReturn(existingUser);

        assertThatThrownBy(() -> authService.adminLogin("小明", "pass"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("禁用");
    }

    @Test
    @DisplayName("管理员登录 - 密码错误抛异常")
    void adminLogin_wrongPassword() {
        existingUser.setUsername("admin");
        existingUser.setPassword("hashed");
        when(userMapper.selectOne(any())).thenReturn(existingUser);
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.adminLogin("admin", "wrong"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("密码错误");
    }

    @Test
    @DisplayName("getCurrentUser - userId 为 null 抛异常")
    void getCurrentUser_nullUserId() {
        when(jwtService.getCurrentUserId()).thenReturn(null);

        assertThatThrownBy(() -> authService.getCurrentUser())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("未登录");
    }

    @Test
    @DisplayName("getCurrentUser - 用户已删除抛异常")
    void getCurrentUser_userDeleted() {
        when(jwtService.getCurrentUserId()).thenReturn(99L);
        when(userMapper.selectById(99L)).thenReturn(null);

        assertThatThrownBy(() -> authService.getCurrentUser())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("用户不存在");
    }
}
