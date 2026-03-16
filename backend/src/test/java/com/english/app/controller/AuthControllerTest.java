package com.english.app.controller;

import com.english.app.dto.LoginResponse;
import com.english.app.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  AuthService authService;

    @Test
    @DisplayName("微信登录 - 正常返回 token")
    void wechatLogin_success() throws Exception {
        LoginResponse resp = new LoginResponse();
        resp.setUserId(1L);
        resp.setToken("test-token-123");
        resp.setRole("student");
        resp.setNickname("小明");
        resp.setMembershipLevel(0);
        resp.setIsVip(false);

        when(authService.login(anyString(), anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/wechat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", "wx_code_001", "role", "student"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.token").value("test-token-123"))
                .andExpect(jsonPath("$.data.role").value("student"));
    }

    @Test
    @DisplayName("管理员登录 - 密码正确返回 token")
    void adminLogin_success() throws Exception {
        LoginResponse resp = new LoginResponse();
        resp.setUserId(3L);
        resp.setToken("admin-token-456");
        resp.setRole("admin");
        resp.setNickname("运营管理员");
        resp.setMembershipLevel(0);
        resp.setIsVip(false);

        when(authService.adminLogin(anyString(), anyString())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/admin-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("code", "admin", "password", "admin123", "role", "admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.role").value("admin"));
    }

    @Test
    @DisplayName("管理员登录 - 密码错误返回业务错误码")
    void adminLogin_wrongPassword() throws Exception {
        when(authService.adminLogin(anyString(), anyString()))
                .thenThrow(new RuntimeException("密码错误"));

        mockMvc.perform(post("/api/auth/admin-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("code", "admin", "password", "wrong", "role", "admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("密码错误"));
    }
}
