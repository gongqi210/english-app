package com.english.app.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class IncomeDTO {
    private LocalDate date;
    private Double membershipIncome;
    private Double bookIncome;
    private Double otherIncome;
    private Double totalIncome;
    private Integer newStudents;
    private Integer activeStudents;
}
