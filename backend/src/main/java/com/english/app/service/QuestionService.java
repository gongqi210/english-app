package com.english.app.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.english.app.dto.CreateQuestionRequest;
import com.english.app.dto.ImportResultDTO;
import com.english.app.dto.QuestionDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface QuestionService {
    IPage<QuestionDTO> getQuestions(String type, String keyword, int pageNum, int pageSize);
    QuestionDTO createQuestion(CreateQuestionRequest request);
    QuestionDTO updateQuestion(Long id, CreateQuestionRequest request);
    void deleteQuestion(Long id);
    QuestionDTO copyQuestion(Long id);
    List<QuestionDTO> getQuestionsByIds(List<Long> ids);
    ImportResultDTO importQuestions(MultipartFile file) throws IOException;
    byte[] buildImportTemplate() throws IOException;
}
