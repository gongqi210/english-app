package com.english.app.common;

/**
 * 用户上下文 - ThreadLocal工具类
 * 用于存储和获取当前登录用户ID
 */
public class UserContext {

    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();

    /**
     * 设置当前用户ID
     */
    public static void setUserId(Long userId) {
        USER_ID.set(userId);
    }

    /**
     * 获取当前用户ID
     */
    public static Long getUserId() {
        return USER_ID.get();
    }

    /**
     * 清除当前用户ID
     */
    public static void clear() {
        USER_ID.remove();
    }
}
