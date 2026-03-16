package com.english.app.dto;

import lombok.Data;

/**
 * 学生端作业列表项
 */
@Data
public class HomeworkListItemDTO {
    private Long id;
    private String title;
    private String deadline;
    private Integer questionCount;
    private Integer duration;
    private Integer progress;
    private Boolean completed;
    private Integer score;
    private String timeSpent;
}
