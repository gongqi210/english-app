package com.english.app.service;

import com.english.app.dto.DashboardDTO;
import com.english.app.dto.IncomeDTO;

import java.util.List;

public interface StatisticsService {
    /**
     * 获取数据看板
     */
    DashboardDTO getDashboard();

    /**
     * 获取收入列表
     */
    List<IncomeDTO> getIncomeList(String startDate, String endDate);

    /**
     * 获取收入趋势
     */
    List<IncomeDTO> getIncomeTrend(Integer days);
}
