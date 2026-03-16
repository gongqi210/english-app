package com.english.app.dto;

import lombok.Data;

@Data
public class CreateQuestionRequest {
    private String type;
    private String content;
    private String answer;
    private String imageUrl;
    private String knowledgePoint;
    private Integer difficulty;
    private String tags;
}
