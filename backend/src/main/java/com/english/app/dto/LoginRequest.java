package com.english.app.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String code;       // 微信code（管理后台登录时传用户名/手机号）
    private String password;   // 管理后台登录密码
    private String role;       // 角色
    private String nickname;
    private String avatar;
}
