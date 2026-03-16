package com.english.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChildHomeworkDTO {
    private HomeworkListItemDTO todayHomework;
    private List<HomeworkListItemDTO> pendingHomework;
    private List<CompletedHomeworkItem> completedHomework;
    private WeeklyStats weeklyStats;
    private List<TrendPoint> trendData;

    @Data
    public static class CompletedHomeworkItem {
        private Long id;
        private String title;
        private Integer score;
        private Integer stars;
        private String date;
        private String timeSpent;
    }

    @Data
    public static class WeeklyStats {
        private Integer total;
        private Integer completed;
        private Integer avgScore;
        private Integer totalTime;
    }

    @Data
    public static class TrendPoint {
        private String day;
        private Integer score;
    }
}
