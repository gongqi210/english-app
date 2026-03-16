package com.english.app.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.english.app.common.Result;
import com.english.app.dto.CreateQuestionRequest;
import com.english.app.dto.ImportResultDTO;
import com.english.app.dto.QuestionDTO;
import com.english.app.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/api/teacher/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    /**
     * 题目列表（分页 + 筛选）
     */
    @GetMapping
    public Result<IPage<QuestionDTO>> getQuestions(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "1") int pageNum,
        @RequestParam(defaultValue = "20") int pageSize
    ) {
        return Result.success(questionService.getQuestions(type, keyword, pageNum, pageSize));
    }

    /**
     * 创建题目
     */
    @PostMapping
    public Result<QuestionDTO> createQuestion(@RequestBody CreateQuestionRequest request) {
        return Result.success(questionService.createQuestion(request));
    }

    /**
     * 更新题目
     */
    @PutMapping("/{id}")
    public Result<QuestionDTO> updateQuestion(
        @PathVariable Long id,
        @RequestBody CreateQuestionRequest request
    ) {
        return Result.success(questionService.updateQuestion(id, request));
    }

    /**
     * 删除题目
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return Result.success();
    }

    /**
     * 复制题目
     */
    @PostMapping("/{id}/copy")
    public Result<QuestionDTO> copyQuestion(@PathVariable Long id) {
        return Result.success(questionService.copyQuestion(id));
    }

    /**
     * 下载批量导入模板
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] bytes = questionService.buildImportTemplate();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"question-import-template.xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(bytes);
    }

    /**
     * 批量导入题目
     */
    @PostMapping("/import")
    public Result<ImportResultDTO> importQuestions(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(questionService.importQuestions(file));
    }
}
