package com.english.app.service;

public interface JwtService {
    /**
     * 生成Token
     */
    String generateToken(Long userId);

    /**
     * 解析Token
     */
    Long parseToken(String token);

    /**
     * 获取当前用户ID
     */
    Long getCurrentUserId();
}
