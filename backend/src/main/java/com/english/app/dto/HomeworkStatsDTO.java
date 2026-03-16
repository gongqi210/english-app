package com.english.app.dto;

import lombok.Data;

@Data
public class HomeworkStatsDTO {
    private Integer assigned;
    private Integer submitRate;
    private Integer completeRate;
    private Integer avgScore;
}
