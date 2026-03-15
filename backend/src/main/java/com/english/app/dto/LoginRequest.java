package com.english.app.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String code;       // 微信code
    private String role;       // 角色: student/parent/teacher/principal
    private String nickname;
    private String avatar;
}
