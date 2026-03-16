package com.english.app.service;

import com.english.app.dto.*;

import java.util.List;

public interface HomeworkService {
    // 学生端
    List<HomeworkListItemDTO> getStudentHomeworkList(String status);
    HomeworkDetailDTO getHomeworkDetail(Long id);
    HomeworkDetailDTO submitHomework(Long id, SubmitHomeworkRequest request);

    // 老师端
    List<TeacherHomeworkItemDTO> getTeacherHomeworkList(String status);
    HomeworkStatsDTO getTeacherStats();
    HomeworkDetailDTO createHomework(CreateHomeworkRequest request);
    HomeworkDetailDTO saveDraft(CreateHomeworkRequest request);
    void publishHomework(Long id);
    List<StudentSubmissionDTO> getSubmissions(Long homeworkId);
    String generateAIFeedback(Long homeworkId, Long studentId);
    void sendFeedback(Long homeworkId, FeedbackRequest request);

    // 家长端
    ChildHomeworkDTO getChildHomework(Long childId);
    void remindHomework(Long childId, Long homeworkId);
}
