package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.*;
import com.english.app.service.HomeworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    // ==================== 学生端 ====================

    /**
     * 学生作业列表
     * GET /api/homework?status=all|pending|completed
     */
    @GetMapping("/api/homework")
    public Result<List<HomeworkListItemDTO>> getStudentHomeworkList(
        @RequestParam(defaultValue = "all") String status
    ) {
        return Result.success(homeworkService.getStudentHomeworkList(status));
    }

    /**
     * 作业详情（学生/老师通用）
     * GET /api/homework/{id}
     */
    @GetMapping("/api/homework/{id}")
    public Result<HomeworkDetailDTO> getHomeworkDetail(@PathVariable Long id) {
        return Result.success(homeworkService.getHomeworkDetail(id));
    }

    /**
     * 提交作业
     * POST /api/homework/{id}/submit
     */
    @PostMapping("/api/homework/{id}/submit")
    public Result<HomeworkDetailDTO> submitHomework(
        @PathVariable Long id,
        @RequestBody SubmitHomeworkRequest request
    ) {
        return Result.success(homeworkService.submitHomework(id, request));
    }

    // ==================== 闯关关卡 ====================

    /**
     * 获取闯关关卡（由作业的题目动态生成关卡列表）
     * GET /api/challenge/{homeworkId}/levels
     */
    @GetMapping("/api/challenge/{homeworkId}/levels")
    public Result<HomeworkDetailDTO> getChallengeLevels(@PathVariable Long homeworkId) {
        return Result.success(homeworkService.getHomeworkDetail(homeworkId));
    }

    // ==================== 老师端 ====================

    /**
     * 老师作业列表
     * GET /api/teacher/homework?status=all|ongoing|finished
     */
    @GetMapping("/api/teacher/homework")
    public Result<List<TeacherHomeworkItemDTO>> getTeacherHomeworkList(
        @RequestParam(defaultValue = "all") String status
    ) {
        return Result.success(homeworkService.getTeacherHomeworkList(status));
    }

    /**
     * 老师总统计（本周汇总）
     * GET /api/teacher/homework/stats  (注意：manage.js 中不传 homeworkId)
     */
    @GetMapping("/api/teacher/homework/stats")
    public Result<HomeworkStatsDTO> getTeacherStats() {
        return Result.success(homeworkService.getTeacherStats());
    }

    /**
     * 创建作业（发布）
     * POST /api/teacher/homework
     */
    @PostMapping("/api/teacher/homework")
    public Result<HomeworkDetailDTO> createHomework(@RequestBody CreateHomeworkRequest request) {
        return Result.success(homeworkService.createHomework(request));
    }

    /**
     * 保存草稿
     * POST /api/teacher/homework/draft
     */
    @PostMapping("/api/teacher/homework/draft")
    public Result<HomeworkDetailDTO> saveDraft(@RequestBody CreateHomeworkRequest request) {
        return Result.success(homeworkService.saveDraft(request));
    }

    /**
     * 发布作业
     * POST /api/teacher/homework/{id}/publish
     */
    @PostMapping("/api/teacher/homework/{id}/publish")
    public Result<Void> publishHomework(@PathVariable Long id) {
        homeworkService.publishHomework(id);
        return Result.success();
    }

    /**
     * 获取学生提交列表
     * GET /api/teacher/homework/{id}/submissions
     */
    @GetMapping("/api/teacher/homework/{id}/submissions")
    public Result<List<StudentSubmissionDTO>> getSubmissions(@PathVariable Long id) {
        return Result.success(homeworkService.getSubmissions(id));
    }

    /**
     * 生成AI反馈
     * POST /api/teacher/feedback/ai-generate
     */
    @PostMapping("/api/teacher/feedback/ai-generate")
    public Result<FeedbackResponse> generateAIFeedback(@RequestBody AiFeedbackRequest request) {
        String feedback = homeworkService.generateAIFeedback(request.getHomeworkId(), request.getStudentId());
        FeedbackResponse resp = new FeedbackResponse();
        resp.setFeedback(feedback);
        return Result.success(resp);
    }

    /**
     * 发送反馈
     * POST /api/teacher/homework/{id}/feedback
     */
    @PostMapping("/api/teacher/homework/{id}/feedback")
    public Result<Void> sendFeedback(@PathVariable Long id, @RequestBody FeedbackRequest request) {
        homeworkService.sendFeedback(id, request);
        return Result.success();
    }

    // ==================== 家长端 ====================

    /**
     * 查看孩子作业
     * GET /api/parent/children/{childId}/homework
     */
    @GetMapping("/api/parent/children/{childId}/homework")
    public Result<ChildHomeworkDTO> getChildHomework(@PathVariable Long childId) {
        return Result.success(homeworkService.getChildHomework(childId));
    }

    /**
     * 提醒孩子做作业
     * POST /api/parent/children/{childId}/homework/{homeworkId}/remind
     */
    @PostMapping("/api/parent/children/{childId}/homework/{homeworkId}/remind")
    public Result<Void> remindHomework(
        @PathVariable Long childId,
        @PathVariable Long homeworkId
    ) {
        homeworkService.remindHomework(childId, homeworkId);
        return Result.success();
    }

    // ==================== 内部 DTO ====================

    @lombok.Data
    static class AiFeedbackRequest {
        private Long homeworkId;
        private Long studentId;
    }

    @lombok.Data
    static class FeedbackResponse {
        private String feedback;
    }
}
