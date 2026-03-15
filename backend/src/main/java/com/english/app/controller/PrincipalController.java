package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.dto.DashboardDTO;
import com.english.app.dto.IncomeDTO;
import com.english.app.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/principal")
@RequiredArgsConstructor
public class PrincipalController {

    private final StatisticsService statisticsService;

    /**
     * 获取数据看板
     */
    @GetMapping("/dashboard")
    public Result<DashboardDTO> getDashboard() {
        return Result.success(statisticsService.getDashboard());
    }

    /**
     * 获取收入报表
     */
    @GetMapping("/income")
    public Result<List<IncomeDTO>> getIncome(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(statisticsService.getIncomeList(startDate, endDate));
    }

    /**
     * 获取收入趋势
     */
    @GetMapping("/income/trend")
    public Result<List<IncomeDTO>> getIncomeTrend(@RequestParam(defaultValue = "30") Integer days) {
        return Result.success(statisticsService.getIncomeTrend(days));
    }
}
