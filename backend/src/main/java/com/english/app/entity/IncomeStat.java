package com.english.app.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("income_stat")
public class IncomeStat {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long institutionId;
    private Long campusId;
    private LocalDate date;

    private BigDecimal membershipIncome;
    private BigDecimal bookIncome;
    private BigDecimal otherIncome;
    private BigDecimal totalIncome;

    private Integer newStudents;
    private Integer activeStudents;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
