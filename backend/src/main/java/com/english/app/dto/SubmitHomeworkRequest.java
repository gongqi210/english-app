package com.english.app.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SubmitHomeworkRequest {
    // key: questionId, value: student answer
    private Map<String, String> answers;
    private Integer timeSpentSeconds;
}
