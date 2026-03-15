package com.english.app.dto;

import lombok.Data;

@Data
public class DashboardDTO {
    private Integer totalStudents;
    private Integer todayStudents;
    private Integer totalTeachers;
    private Integer totalCampuses;

    private Double todayIncome;
    private Double monthIncome;
    private Double totalIncome;

    private Integer todayHomework;
    private Integer pendingReview;
    private Double avgScore;

    private List<TeacherRankDTO> topTeachers;
    private List<IncomeDTO> recentIncome;
}
