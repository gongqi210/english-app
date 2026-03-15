package com.english.app.dto;

import lombok.Data;

@Data
public class MembershipLevelDTO {
    private Long id;
    private String name;
    private Integer level;
    private Integer price;
    private Integer durationDays;
    private String[] features;
    private Boolean isCurrent;
}
