package com.english.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateHomeworkRequest {
    private String title;
    private String classId;
    private String deadline;
    private List<Long> questionIds;
    private Boolean showExplanation;
    private Boolean showRanking;
    private Boolean allowRetry;
}
