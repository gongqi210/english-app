package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.CreateQuestionRequest;
import com.english.app.dto.QuestionDTO;
import com.english.app.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    /**
     * 题目列表（支持按类型、关键词筛选）
     */
    @GetMapping
    public Result<List<QuestionDTO>> getQuestions(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String keyword
    ) {
        return Result.success(questionService.getQuestions(type, keyword));
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
}
