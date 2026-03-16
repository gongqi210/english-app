package com.english.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class ImportResultDTO {
    private int success;
    private int failed;
    private List<ErrorItem> errors;

    @Data
    public static class ErrorItem {
        private int row;
        private String message;
    }
}
