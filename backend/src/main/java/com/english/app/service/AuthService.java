package com.english.app.service;

import com.english.app.dto.LoginResponse;

public interface AuthService {
    /**
     * 微信登录
     * @param code 微信授权码
     * @param role 用户角色
     * @return 登录结果
     */
    LoginResponse login(String code, String role);

    /**
     * 获取当前登录用户
     * @return 用户信息
     */
    LoginResponse getCurrentUser();

    /**
     * 退出登录
     */
    void logout();
}
