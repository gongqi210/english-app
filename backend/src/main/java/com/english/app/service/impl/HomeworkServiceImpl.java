package com.english.app.service.impl;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.*;
import com.english.app.entity.Homework;
import com.english.app.entity.HomeworkSubmission;
import com.english.app.entity.User;
import com.english.app.mapper.HomeworkMapper;
import com.english.app.mapper.HomeworkSubmissionMapper;
import com.english.app.mapper.UserMapper;
import com.english.app.service.HomeworkService;
import com.english.app.service.JwtService;
import com.english.app.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeworkServiceImpl implements HomeworkService {

    private final HomeworkMapper homeworkMapper;
    private final HomeworkSubmissionMapper submissionMapper;
    private final UserMapper userMapper;
    private final QuestionService questionService;
    private final JwtService jwtService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("M月d日");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("M月d日 HH:mm");

    // ==================== 学生端 ====================

    @Override
    public List<HomeworkListItemDTO> getStudentHomeworkList(String status) {
        Long studentId = jwtService.getCurrentUserId();

        // 查找该学生所属机构的作业（简化：查询所有 published 作业）
        LambdaQueryWrapper<Homework> wrapper = new LambdaQueryWrapper<Homework>()
            .eq(Homework::getStatus, "published")
            .orderByDesc(Homework::getDeadline);

        List<Homework> homeworks = homeworkMapper.selectList(wrapper);

        // 查询提交记录
        List<HomeworkSubmission> submissions = submissionMapper.selectList(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getStudentId, studentId)
        );
        Map<Long, HomeworkSubmission> submissionMap = submissions.stream()
            .collect(Collectors.toMap(HomeworkSubmission::getHomeworkId, s -> s));

        return homeworks.stream()
            .map(hw -> {
                HomeworkSubmission sub = submissionMap.get(hw.getId());
                boolean completed = sub != null && "submitted".equals(sub.getStatus());
                if ("pending".equals(status) && completed) return null;
                if ("completed".equals(status) && !completed) return null;

                HomeworkListItemDTO dto = new HomeworkListItemDTO();
                dto.setId(hw.getId());
                dto.setTitle(hw.getTitle());
                dto.setDeadline(hw.getDeadline() != null ? hw.getDeadline().format(DATETIME_FMT) : "");
                dto.setCompleted(completed);
                dto.setProgress(completed ? 100 : 0);
                dto.setScore(sub != null ? sub.getScore() : null);

                List<Long> qIds = parseIds(hw.getQuestionIds());
                dto.setQuestionCount(qIds.size());
                dto.setDuration(qIds.size() * 3);
                return dto;
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }

    @Override
    public HomeworkDetailDTO getHomeworkDetail(Long id) {
        Homework hw = homeworkMapper.selectById(id);
        if (hw == null) throw new RuntimeException("作业不存在");

        List<Long> qIds = parseIds(hw.getQuestionIds());
        List<QuestionDTO> questions = questionService.getQuestionsByIds(qIds);

        HomeworkDetailDTO dto = new HomeworkDetailDTO();
        dto.setId(hw.getId());
        dto.setTitle(hw.getTitle());
        dto.setDescription(hw.getDescription());
        dto.setDeadline(hw.getDeadline() != null ? hw.getDeadline().format(DATETIME_FMT) : "");
        dto.setTotalScore(hw.getTotalScore());
        dto.setStatus(hw.getStatus());
        dto.setQuestions(questions);
        return dto;
    }

    @Override
    public HomeworkDetailDTO submitHomework(Long id, SubmitHomeworkRequest request) {
        Long studentId = jwtService.getCurrentUserId();

        // 查找或创建提交记录
        HomeworkSubmission sub = submissionMapper.selectOne(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getHomeworkId, id)
                .eq(HomeworkSubmission::getStudentId, studentId)
        );

        if (sub == null) {
            sub = new HomeworkSubmission();
            sub.setHomeworkId(id);
            sub.setStudentId(studentId);
        }

        sub.setAnswers(JSONUtil.toJsonStr(request.getAnswers()));
        sub.setScore(calculateScore(id, request.getAnswers()));
        sub.setStatus("submitted");
        sub.setSubmitTime(LocalDateTime.now());

        if (sub.getId() == null) {
            submissionMapper.insert(sub);
        } else {
            submissionMapper.updateById(sub);
        }

        return getHomeworkDetail(id);
    }

    // ==================== 老师端 ====================

    @Override
    public List<TeacherHomeworkItemDTO> getTeacherHomeworkList(String status) {
        Long teacherId = jwtService.getCurrentUserId();

        LambdaQueryWrapper<Homework> wrapper = new LambdaQueryWrapper<Homework>()
            .eq(Homework::getCreatorId, teacherId)
            .orderByDesc(Homework::getCreateTime);

        if (StringUtils.hasText(status) && !"all".equals(status)) {
            if ("ongoing".equals(status)) {
                wrapper.eq(Homework::getStatus, "published")
                    .gt(Homework::getDeadline, LocalDateTime.now());
            } else if ("finished".equals(status)) {
                wrapper.in(Homework::getStatus, "closed", "published")
                    .le(Homework::getDeadline, LocalDateTime.now());
            }
        }

        List<Homework> homeworks = homeworkMapper.selectList(wrapper);

        return homeworks.stream().map(hw -> {
            TeacherHomeworkItemDTO dto = new TeacherHomeworkItemDTO();
            dto.setId(hw.getId());
            dto.setTitle(hw.getTitle());

            boolean expired = hw.getDeadline() != null && hw.getDeadline().isBefore(LocalDateTime.now());
            String hwStatus = expired ? "finished" : hw.getStatus();
            dto.setStatus(hwStatus);
            dto.setStatusText("finished".equals(hwStatus) ? "已结束" : "进行中");

            String dateRange = "";
            if (hw.getCreateTime() != null && hw.getDeadline() != null) {
                dateRange = hw.getCreateTime().format(DATE_FMT) + " - " + hw.getDeadline().format(DATE_FMT);
            }
            dto.setDateRange(dateRange);

            // 统计提交情况
            List<HomeworkSubmission> subs = submissionMapper.selectList(
                new LambdaQueryWrapper<HomeworkSubmission>()
                    .eq(HomeworkSubmission::getHomeworkId, hw.getId())
                    .eq(HomeworkSubmission::getStatus, "submitted")
            );
            int submitted = subs.size();
            int studentCount = Math.max(submitted, 1); // 简化处理
            int avgScore = subs.stream().filter(s -> s.getScore() != null)
                .mapToInt(HomeworkSubmission::getScore).sum();
            if (!subs.isEmpty()) avgScore /= subs.size();
            int excellent = (int) subs.stream().filter(s -> s.getScore() != null && s.getScore() >= 90).count();
            int needsHelp = (int) subs.stream().filter(s -> s.getScore() != null && s.getScore() < 70).count();

            dto.setStudentCount(studentCount);
            dto.setSubmitted(submitted);
            dto.setSubmitRate(studentCount > 0 ? submitted * 100 / studentCount : 0);
            dto.setAvgScore(avgScore);
            dto.setExcellentCount(excellent);
            dto.setNeedsImprovement(needsHelp);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public HomeworkStatsDTO getTeacherStats() {
        Long teacherId = jwtService.getCurrentUserId();

        List<Homework> homeworks = homeworkMapper.selectList(
            new LambdaQueryWrapper<Homework>().eq(Homework::getCreatorId, teacherId)
        );

        HomeworkStatsDTO stats = new HomeworkStatsDTO();
        stats.setAssigned(homeworks.size());

        if (homeworks.isEmpty()) {
            stats.setSubmitRate(0);
            stats.setCompleteRate(0);
            stats.setAvgScore(0);
            return stats;
        }

        List<Long> hwIds = homeworks.stream().map(Homework::getId).collect(Collectors.toList());
        List<HomeworkSubmission> subs = submissionMapper.selectList(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .in(HomeworkSubmission::getHomeworkId, hwIds)
                .eq(HomeworkSubmission::getStatus, "submitted")
        );

        int totalScore = subs.stream().filter(s -> s.getScore() != null)
            .mapToInt(HomeworkSubmission::getScore).sum();
        int scoredCount = (int) subs.stream().filter(s -> s.getScore() != null).count();

        stats.setSubmitRate(subs.isEmpty() ? 0 : Math.min(100, subs.size() * 10));
        stats.setCompleteRate(subs.isEmpty() ? 0 : Math.min(100, subs.size() * 10));
        stats.setAvgScore(scoredCount > 0 ? totalScore / scoredCount : 0);
        return stats;
    }

    @Override
    public HomeworkDetailDTO createHomework(CreateHomeworkRequest request) {
        return saveHomework(request, "published");
    }

    @Override
    public HomeworkDetailDTO saveDraft(CreateHomeworkRequest request) {
        return saveHomework(request, "draft");
    }

    @Override
    public void publishHomework(Long id) {
        Homework hw = homeworkMapper.selectById(id);
        if (hw == null) throw new RuntimeException("作业不存在");
        hw.setStatus("published");
        hw.setPublishTime(LocalDateTime.now());
        homeworkMapper.updateById(hw);
    }

    @Override
    public List<StudentSubmissionDTO> getSubmissions(Long homeworkId) {
        List<HomeworkSubmission> subs = submissionMapper.selectList(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getHomeworkId, homeworkId)
        );

        return subs.stream().map(sub -> {
            StudentSubmissionDTO dto = new StudentSubmissionDTO();
            dto.setId(sub.getStudentId());
            dto.setScore(sub.getScore());
            dto.setStatus(sub.getStatus());

            User user = userMapper.selectById(sub.getStudentId());
            if (user != null) {
                dto.setName(user.getNickname() != null ? user.getNickname() : user.getUsername());
                dto.setAvatar(user.getAvatar());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public String generateAIFeedback(Long homeworkId, Long studentId) {
        HomeworkSubmission sub = submissionMapper.selectOne(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getHomeworkId, homeworkId)
                .eq(HomeworkSubmission::getStudentId, studentId)
        );

        User student = userMapper.selectById(studentId);
        String studentName = student != null
            ? (student.getNickname() != null ? student.getNickname() : student.getUsername())
            : "同学";
        int score = sub != null && sub.getScore() != null ? sub.getScore() : 0;

        return String.format("""
            【作业反馈】

            %s本次作业完成情况%s！得分：%d分

            ✅ 表现优秀：
            - 认真完成了本次作业
            - 整体答题规范

            💪 需要加强：
            - 继续巩固本单元词汇
            - 建议每天复习10分钟

            🌟 总体评价：
            继续加油，期待下一次的进步！""",
            studentName,
            score >= 90 ? "非常出色" : score >= 70 ? "良好" : "还需努力",
            score
        );
    }

    @Override
    public void sendFeedback(Long homeworkId, FeedbackRequest request) {
        HomeworkSubmission sub = submissionMapper.selectOne(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getHomeworkId, homeworkId)
                .eq(HomeworkSubmission::getStudentId, request.getStudentId())
        );

        if (sub == null) throw new RuntimeException("提交记录不存在");

        sub.setAiFeedback(request.getAiFeedback());
        sub.setTeacherFeedback(request.getTeacherFeedback());
        sub.setStatus("reviewed");
        sub.setReviewTime(LocalDateTime.now());
        submissionMapper.updateById(sub);
    }

    // ==================== 家长端 ====================

    @Override
    public ChildHomeworkDTO getChildHomework(Long childId) {
        // 查询该学生的作业提交记录
        List<HomeworkSubmission> subs = submissionMapper.selectList(
            new LambdaQueryWrapper<HomeworkSubmission>()
                .eq(HomeworkSubmission::getStudentId, childId)
                .orderByDesc(HomeworkSubmission::getSubmitTime)
        );
        Map<Long, HomeworkSubmission> subMap = subs.stream()
            .collect(Collectors.toMap(HomeworkSubmission::getHomeworkId, s -> s));

        // 查询所有已发布的作业
        List<Homework> homeworks = homeworkMapper.selectList(
            new LambdaQueryWrapper<Homework>()
                .eq(Homework::getStatus, "published")
                .orderByDesc(Homework::getDeadline)
        );

        ChildHomeworkDTO result = new ChildHomeworkDTO();
        List<HomeworkListItemDTO> pending = new ArrayList<>();
        List<ChildHomeworkDTO.CompletedHomeworkItem> completed = new ArrayList<>();
        int totalScore = 0;
        int scoredCount = 0;

        for (Homework hw : homeworks) {
            HomeworkSubmission sub = subMap.get(hw.getId());
            boolean isCompleted = sub != null && "submitted".equals(sub.getStatus());

            if (isCompleted) {
                ChildHomeworkDTO.CompletedHomeworkItem item = new ChildHomeworkDTO.CompletedHomeworkItem();
                item.setId(hw.getId());
                item.setTitle(hw.getTitle());
                item.setScore(sub.getScore());
                item.setStars(sub.getScore() != null ? sub.getScore() / 20 : 0);
                item.setDate(sub.getSubmitTime() != null ? sub.getSubmitTime().format(DATE_FMT) : "");
                item.setTimeSpent("--");
                completed.add(item);
                if (sub.getScore() != null) {
                    totalScore += sub.getScore();
                    scoredCount++;
                }
            } else {
                HomeworkListItemDTO dto = new HomeworkListItemDTO();
                dto.setId(hw.getId());
                dto.setTitle(hw.getTitle());
                dto.setDeadline(hw.getDeadline() != null ? hw.getDeadline().format(DATETIME_FMT) : "");
                dto.setCompleted(false);
                dto.setProgress(0);
                List<Long> qIds = parseIds(hw.getQuestionIds());
                dto.setQuestionCount(qIds.size());
                dto.setDuration(qIds.size() * 3);
                pending.add(dto);
            }
        }

        result.setTodayHomework(pending.isEmpty() ? null : pending.get(0));
        result.setPendingHomework(pending);
        result.setCompletedHomework(completed);

        ChildHomeworkDTO.WeeklyStats stats = new ChildHomeworkDTO.WeeklyStats();
        stats.setTotal(homeworks.size());
        stats.setCompleted(completed.size());
        stats.setAvgScore(scoredCount > 0 ? totalScore / scoredCount : 0);
        stats.setTotalTime(completed.size() * 10);
        result.setWeeklyStats(stats);

        // 简化趋势数据
        List<ChildHomeworkDTO.TrendPoint> trend = new ArrayList<>();
        String[] days = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        for (String day : days) {
            ChildHomeworkDTO.TrendPoint pt = new ChildHomeworkDTO.TrendPoint();
            pt.setDay(day);
            pt.setScore(scoredCount > 0 ? totalScore / scoredCount : 0);
            trend.add(pt);
        }
        result.setTrendData(trend);
        return result;
    }

    @Override
    public void remindHomework(Long childId, Long homeworkId) {
        // 发送提醒通知（此处为占位实现，实际需要集成微信推送）
    }

    // ==================== 私有方法 ====================

    private HomeworkDetailDTO saveHomework(CreateHomeworkRequest request, String status) {
        Long teacherId = jwtService.getCurrentUserId();

        Homework hw = new Homework();
        hw.setTitle(request.getTitle());
        hw.setCreatorId(teacherId);
        hw.setClassIds(request.getClassId());
        if (StringUtils.hasText(request.getDeadline())) {
            hw.setDeadline(LocalDateTime.parse(request.getDeadline() + "T23:59:59"));
        }
        hw.setQuestionIds(JSONUtil.toJsonStr(request.getQuestionIds()));
        hw.setTotalScore(100);
        hw.setStatus(status);
        if ("published".equals(status)) {
            hw.setPublishTime(LocalDateTime.now());
        }
        homeworkMapper.insert(hw);

        return getHomeworkDetail(hw.getId());
    }

    private int calculateScore(Long homeworkId, Map<String, String> answers) {
        if (answers == null || answers.isEmpty()) return 0;
        Homework hw = homeworkMapper.selectById(homeworkId);
        if (hw == null) return 0;
        List<Long> qIds = parseIds(hw.getQuestionIds());
        if (qIds.isEmpty()) return 100;
        // 简化评分：每题等分，实际需要校对答案
        return 80;
    }

    private List<Long> parseIds(String json) {
        if (!StringUtils.hasText(json)) return List.of();
        try {
            return JSONUtil.parseArray(json).stream()
                .map(o -> Long.parseLong(o.toString()))
                .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }
}
