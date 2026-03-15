package com.english.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.DashboardDTO;
import com.english.app.dto.IncomeDTO;
import com.english.app.dto.TeacherRankDTO;
import com.english.app.entity.Campus;
import com.english.app.entity.IncomeStat;
import com.english.app.entity.User;
import com.english.app.mapper.CampusMapper;
import com.english.app.mapper.IncomeStatMapper;
import com.english.app.mapper.UserMapper;
import com.english.app.service.JwtService;
import com.english.app.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final UserMapper userMapper;
    private final CampusMapper campusMapper;
    private final IncomeStatMapper incomeStatMapper;
    private final JwtService jwtService;

    @Override
    public DashboardDTO getDashboard() {
        Long institutionId = jwtService.getCurrentUserId(); // TODO: 实际应该从token获取

        DashboardDTO dto = new DashboardDTO();

        // 学生统计
        Long studentCount = userMapper.selectCount(
            new LambdaQueryWrapper<User>()
                .eq(User::getRole, "student")
                .eq(User::getInstitutionId, institutionId)
        );
        dto.setTotalStudents(studentCount.intValue());
        dto.setTodayStudents((int)(studentCount * 0.3)); // 模拟

        // 老师统计
        Long teacherCount = userMapper.selectCount(
            new LambdaQueryWrapper<User>()
                .eq(User::getRole, "teacher")
                .eq(User::getInstitutionId, institutionId)
        );
        dto.setTotalTeachers(teacherCount.intValue());

        // 校区统计
        Long campusCount = campusMapper.selectCount(
            new LambdaQueryWrapper<Campus>()
                .eq(Campus::getInstitutionId, institutionId)
        );
        dto.setTotalCampuses(campusCount.intValue());

        // 收入统计
        LocalDate today = LocalDate.now();
        List<IncomeStat> todayStats = incomeStatMapper.selectList(
            new LambdaQueryWrapper<IncomeStat>()
                .eq(IncomeStat::getInstitutionId, institutionId)
                .eq(IncomeStat::getDate, today)
        );

        double todayIncome = todayStats.stream()
                .mapToDouble(IncomeStat::getTotalIncome).sum();
        dto.setTodayIncome(todayIncome);

        // 模拟月收入
        dto.setMonthIncome(todayIncome * 30);
        dto.setTotalIncome(todayIncome * 365);

        // 作业统计
        dto.setTodayHomework(15);
        dto.setPendingReview(8);
        dto.setAvgScore(85.5);

        // 模拟教师排行
        List<TeacherRankDTO> topTeachers = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            TeacherRankDTO teacher = new TeacherRankDTO();
            teacher.setTeacherId((long) i + 1);
            teacher.setTeacherName("老师" + (i + 1));
            teacher.setAvatar("https://picsum.photos/100/100?random=" + (20 + i));
            teacher.setStudentCount(20 + i * 5);
            teacher.setHomeworkCount(30 + i * 10);
            teacher.setAvgScore(85.0 + i * 2);
            topTeachers.add(teacher);
        }
        dto.setTopTeachers(topTeachers);

        // 最近收入
        dto.setRecentIncome(getIncomeTrend(7));

        return dto;
    }

    @Override
    public List<IncomeDTO> getIncomeList(String startDate, String endDate) {
        // 模拟数据
        List<IncomeDTO> list = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            IncomeDTO dto = new IncomeDTO();
            dto.setDate(LocalDate.now().minusDays(i));
            dto.setMembershipIncome(1000.0 + Math.random() * 500);
            dto.setBookIncome(300.0 + Math.random() * 200);
            dto.setOtherIncome(100.0 + Math.random() * 100);
            dto.setTotalIncome(dto.getMembershipIncome() + dto.getBookIncome() + dto.getOtherIncome());
            dto.setNewStudents((int)(Math.random() * 10));
            dto.setActiveStudents((int)(Math.random() * 50));
            list.add(dto);
        }
        return list;
    }

    @Override
    public List<IncomeDTO> getIncomeTrend(Integer days) {
        List<IncomeDTO> list = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            IncomeDTO dto = new IncomeDTO();
            dto.setDate(LocalDate.now().minusDays(i));
            dto.setMembershipIncome(1000.0 + Math.random() * 500);
            dto.setBookIncome(300.0 + Math.random() * 200);
            dto.setTotalIncome(dto.getMembershipIncome() + dto.getBookIncome());
            list.add(dto);
        }
        return list;
    }
}
