package com.english.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private String type;
    private String typeName;
    private String content;
    private String imageUrl;
    private List<OptionDTO> options;
    private String correctKey;
    private Integer difficulty;
    private String knowledgePoint;
    private Integer usageCount;
    private Integer status;
    private String createTime;

    @Data
    public static class OptionDTO {
        private String key;
        private String value;
    }
}
