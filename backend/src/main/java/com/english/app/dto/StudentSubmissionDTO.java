package com.english.app.dto;

import lombok.Data;

@Data
public class StudentSubmissionDTO {
    private Long id;
    private String name;
    private String avatar;
    private Integer score;
    private String status;
}
