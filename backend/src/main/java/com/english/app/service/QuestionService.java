package com.english.app.service;

import com.english.app.dto.CreateQuestionRequest;
import com.english.app.dto.QuestionDTO;

import java.util.List;

public interface QuestionService {
    List<QuestionDTO> getQuestions(String type, String keyword);
    QuestionDTO createQuestion(CreateQuestionRequest request);
    QuestionDTO updateQuestion(Long id, CreateQuestionRequest request);
    void deleteQuestion(Long id);
    QuestionDTO copyQuestion(Long id);
    List<QuestionDTO> getQuestionsByIds(List<Long> ids);
}
