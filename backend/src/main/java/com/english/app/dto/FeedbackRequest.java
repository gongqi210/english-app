package com.english.app.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long studentId;
    private String aiFeedback;
    private String teacherFeedback;
    private Boolean sendToParent;
    private Boolean sendToStudent;
}
