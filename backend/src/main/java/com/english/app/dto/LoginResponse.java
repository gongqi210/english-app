package com.english.app.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String token;
    private String nickname;
    private String avatar;
    private String role;
    private Long institutionId;
    private Long campusId;
    private Integer membershipLevel;  // 0: 免费, 1: 基础, 2: 高级
    private Boolean isVip;
}
