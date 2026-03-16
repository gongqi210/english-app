package com.english.app.controller;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.common.Result;
import com.english.app.dto.DashboardDTO;
import com.english.app.dto.ImportResultDTO;
import com.english.app.dto.IncomeDTO;
import com.english.app.entity.Campus;
import com.english.app.entity.User;
import com.english.app.mapper.CampusMapper;
import com.english.app.mapper.UserMapper;
import com.english.app.service.StatisticsService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/principal")
@RequiredArgsConstructor
public class PrincipalController {

    private final StatisticsService statisticsService;
    private final UserMapper userMapper;
    private final CampusMapper campusMapper;

    // ============ 数据大盘 ============

    @GetMapping("/dashboard")
    public Result<DashboardDTO> getDashboard() {
        return Result.success(statisticsService.getDashboard());
    }

    @GetMapping("/income")
    public Result<List<IncomeDTO>> getIncome(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(statisticsService.getIncomeList(startDate, endDate));
    }

    @GetMapping("/income/trend")
    public Result<List<IncomeDTO>> getIncomeTrend(@RequestParam(defaultValue = "30") Integer days) {
        return Result.success(statisticsService.getIncomeTrend(days));
    }

    // ============ 校区管理 ============

    @GetMapping("/campuses")
    public Result<List<Campus>> getCampuses() {
        return Result.success(campusMapper.selectList(
                new LambdaQueryWrapper<Campus>().eq(Campus::getStatus, 1)));
    }

    // ============ 学生管理 ============

    @GetMapping("/students")
    public Result<IPage<UserSimpleDTO>> getStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long campusId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        IPage<User> page = userMapper.selectPage(
                new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<User>()
                        .eq(User::getRole, "student")
                        .like(StringUtils.hasText(keyword), User::getNickname, keyword)
                        .orderByDesc(User::getCreateTime)
        );
        return Result.success(page.convert(this::toSimpleDTO));
    }

    @GetMapping("/students/template")
    public ResponseEntity<byte[]> downloadStudentTemplate() throws IOException {
        byte[] bytes = buildUserTemplate("学生");
        return templateResponse(bytes, "student-import-template.xlsx");
    }

    @PostMapping("/students/import")
    public Result<ImportResultDTO> importStudents(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(importUsers(file, "student"));
    }

    // ============ 老师管理 ============

    @GetMapping("/teachers")
    public Result<IPage<UserSimpleDTO>> getTeachers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long campusId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        IPage<User> page = userMapper.selectPage(
                new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<User>()
                        .eq(User::getRole, "teacher")
                        .like(StringUtils.hasText(keyword), User::getNickname, keyword)
                        .orderByDesc(User::getCreateTime)
        );
        return Result.success(page.convert(this::toSimpleDTO));
    }

    @GetMapping("/teachers/template")
    public ResponseEntity<byte[]> downloadTeacherTemplate() throws IOException {
        byte[] bytes = buildUserTemplate("老师");
        return templateResponse(bytes, "teacher-import-template.xlsx");
    }

    @PostMapping("/teachers/import")
    public Result<ImportResultDTO> importTeachers(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(importUsers(file, "teacher"));
    }

    // ============ private helpers ============

    @Data
    static class UserImportRow {
        @com.alibaba.excel.annotation.ExcelProperty("姓名")
        private String nickname;

        @com.alibaba.excel.annotation.ExcelProperty("手机号")
        private String phone;

        @com.alibaba.excel.annotation.ExcelProperty("登录密码")
        private String password;
    }

    private ImportResultDTO importUsers(MultipartFile file, String role) throws IOException {
        List<UserImportRow> rows = new ArrayList<>();
        EasyExcel.read(file.getInputStream(), UserImportRow.class,
                new com.alibaba.excel.event.AnalysisEventListener<UserImportRow>() {
                    @Override public void invoke(UserImportRow row, com.alibaba.excel.context.AnalysisContext ctx) { rows.add(row); }
                    @Override public void doAfterAllAnalysed(com.alibaba.excel.context.AnalysisContext ctx) {}
                }).sheet().headRowNumber(1).doRead();

        int success = 0;
        List<ImportResultDTO.ErrorItem> errors = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            UserImportRow row = rows.get(i);
            int rowNum = i + 2;
            try {
                if (!StringUtils.hasText(row.getPhone())) {
                    addError(errors, rowNum, "手机号不能为空"); continue;
                }
                // 手机号去重
                Long exists = userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getPhone, row.getPhone()));
                if (exists > 0) {
                    addError(errors, rowNum, "手机号 " + row.getPhone() + " 已存在"); continue;
                }
                User user = new User();
                user.setNickname(StringUtils.hasText(row.getNickname()) ? row.getNickname() : row.getPhone());
                user.setPhone(row.getPhone());
                user.setUsername(row.getPhone());
                user.setPassword(StringUtils.hasText(row.getPassword()) ? row.getPassword() : "123456");
                user.setRole(role);
                user.setStatus(1);
                userMapper.insert(user);
                success++;
            } catch (Exception e) {
                addError(errors, rowNum, e.getMessage());
            }
        }
        ImportResultDTO result = new ImportResultDTO();
        result.setSuccess(success);
        result.setFailed(errors.size());
        result.setErrors(errors);
        return result;
    }

    private byte[] buildUserTemplate(String roleLabel) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        UserImportRow sample = new UserImportRow();
        sample.setNickname("示例" + roleLabel);
        sample.setPhone("13800138000");
        sample.setPassword("123456");
        EasyExcel.write(out, UserImportRow.class).sheet(roleLabel + "导入模板").doWrite(List.of(sample));
        return out.toByteArray();
    }

    private ResponseEntity<byte[]> templateResponse(byte[] bytes, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    private void addError(List<ImportResultDTO.ErrorItem> errors, int row, String msg) {
        ImportResultDTO.ErrorItem item = new ImportResultDTO.ErrorItem();
        item.setRow(row);
        item.setMessage(msg);
        errors.add(item);
    }

    private UserSimpleDTO toSimpleDTO(User u) {
        UserSimpleDTO dto = new UserSimpleDTO();
        dto.setId(u.getId());
        dto.setNickname(u.getNickname());
        dto.setPhone(u.getPhone());
        dto.setStatus(u.getStatus());
        dto.setCreateTime(u.getCreateTime() != null ? u.getCreateTime().toString() : null);
        return dto;
    }

    @Data
    static class UserSimpleDTO {
        private Long id;
        private String nickname;
        private String phone;
        private Long campusId;
        private String campusName;
        private Integer status;
        private String createTime;
    }
}
