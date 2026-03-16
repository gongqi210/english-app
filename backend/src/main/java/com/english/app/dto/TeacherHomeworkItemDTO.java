package com.english.app.dto;

import lombok.Data;

/**
 * 老师端作业列表项
 */
@Data
public class TeacherHomeworkItemDTO {
    private Long id;
    private String title;
    private String status;
    private String statusText;
    private String dateRange;
    private String className;
    private Integer studentCount;
    private Integer submitRate;
    private Integer submitted;
    private Integer avgScore;
    private Integer excellentCount;
    private Integer needsImprovement;
}
