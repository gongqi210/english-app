package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.LoginRequest;
import com.english.app.dto.LoginResponse;
import com.english.app.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 微信登录（小程序端）
     * POST /api/auth/wechat
     */
    @PostMapping("/wechat")
    public Result<LoginResponse> wechatLogin(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.getCode(), request.getRole());
        return Result.success(response);
    }

    /**
     * 手机号密码登录（兼容旧接口）
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.getCode(), request.getRole());
        return Result.success(response);
    }

    /**
     * 管理后台账号密码登录
     * POST /api/auth/admin-login
     */
    @PostMapping("/admin-login")
    public Result<LoginResponse> adminLogin(@RequestBody LoginRequest request) {
        LoginResponse response = authService.adminLogin(request.getCode(), request.getPassword());
        return Result.success(response);
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public Result<LoginResponse> getUserInfo() {
        return Result.success(authService.getCurrentUser());
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.success();
    }
}
