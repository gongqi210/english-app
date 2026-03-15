package com.english.app.dto;

import lombok.Data;

@Data
public class TeacherRankDTO {
    private Long teacherId;
    private String teacherName;
    private String avatar;
    private Integer studentCount;
    private Integer homeworkCount;
    private Double avgScore;
}
