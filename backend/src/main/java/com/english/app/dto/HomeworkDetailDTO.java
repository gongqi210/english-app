package com.english.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class HomeworkDetailDTO {
    private Long id;
    private String title;
    private String description;
    private String deadline;
    private Integer totalScore;
    private String status;
    private List<QuestionDTO> questions;
}
