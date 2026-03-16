package com.english.app.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.common.Result;
import com.english.app.entity.*;
import com.english.app.mapper.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 运营超管接口
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final InstitutionApplicationMapper applicationMapper;
    private final ContentReportMapper reportMapper;
    private final MembershipOrderMapper orderMapper;
    private final InstitutionMapper institutionMapper;

    // ============ 已入驻机构列表 ============

    @GetMapping("/institutions")
    public Result<IPage<Institution>> getInstitutions(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        LambdaQueryWrapper<Institution> wrapper = new LambdaQueryWrapper<Institution>()
                .like(StringUtils.hasText(keyword), Institution::getName, keyword)
                .orderByDesc(Institution::getCreateTime);
        return Result.success(institutionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    // ============ 机构入驻申请 ============

    @GetMapping("/applications")
    public Result<IPage<InstitutionApplication>> getApplications(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        LambdaQueryWrapper<InstitutionApplication> wrapper = new LambdaQueryWrapper<InstitutionApplication>()
                .eq(StringUtils.hasText(status), InstitutionApplication::getStatus, status)
                .orderByDesc(InstitutionApplication::getCreateTime);
        return Result.success(applicationMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping("/applications/{id}/approve")
    public Result<Void> approveApplication(@PathVariable Long id, @RequestBody(required = false) NoteRequest req) {
        InstitutionApplication app = applicationMapper.selectById(id);
        if (app == null) return Result.error("申请不存在");
        app.setStatus("approved");
        app.setReviewTime(LocalDateTime.now());
        if (req != null) app.setReviewNote(req.getNote());
        applicationMapper.updateById(app);

        // 同步创建机构
        Institution inst = new Institution();
        inst.setName(app.getName());
        inst.setContact(app.getContact());
        inst.setPhone(app.getPhone());
        inst.setAddress(app.getAddress());
        inst.setStatus(1);
        institutionMapper.insert(inst);

        return Result.success();
    }

    @PostMapping("/applications/{id}/reject")
    public Result<Void> rejectApplication(@PathVariable Long id, @RequestBody NoteRequest req) {
        InstitutionApplication app = applicationMapper.selectById(id);
        if (app == null) return Result.error("申请不存在");
        app.setStatus("rejected");
        app.setReviewTime(LocalDateTime.now());
        if (req != null) app.setReviewNote(req.getNote());
        applicationMapper.updateById(app);
        return Result.success();
    }

    // ============ 用户管理 ============

    @GetMapping("/users")
    public Result<IPage<UserDTO>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .like(StringUtils.hasText(keyword), User::getNickname, keyword)
                .eq(StringUtils.hasText(role), User::getRole, role)
                .eq(status != null, User::getStatus, status)
                .orderByDesc(User::getCreateTime);

        IPage<User> page = userMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(page.convert(this::toUserDTO));
    }

    @PostMapping("/users/{id}/ban")
    public Result<Void> banUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        user.setStatus(0);
        userMapper.updateById(user);
        return Result.success();
    }

    @PostMapping("/users/{id}/unban")
    public Result<Void> unbanUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        user.setStatus(1);
        userMapper.updateById(user);
        return Result.success();
    }

    @PostMapping("/users/{id}/reset-password")
    public Result<Map<String, String>> resetPassword(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) return Result.error("用户不存在");
        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
        return Result.success(Map.of("newPassword", newPassword));
    }

    // ============ 内容举报 ============

    @GetMapping("/reports")
    public Result<IPage<ContentReport>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        LambdaQueryWrapper<ContentReport> wrapper = new LambdaQueryWrapper<ContentReport>()
                .eq(StringUtils.hasText(status), ContentReport::getStatus, status)
                .orderByDesc(ContentReport::getCreateTime);
        return Result.success(reportMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping("/reports/{id}/handle")
    public Result<Void> handleReport(@PathVariable Long id, @RequestBody HandleReportRequest req) {
        ContentReport report = reportMapper.selectById(id);
        if (report == null) return Result.error("举报不存在");
        report.setStatus("handled");
        report.setHandleTime(LocalDateTime.now());
        if (req != null) report.setHandleNote(req.getNote());
        reportMapper.updateById(report);
        return Result.success();
    }

    // ============ 会员订单 ============

    @GetMapping("/orders")
    public Result<IPage<MembershipOrder>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        LambdaQueryWrapper<MembershipOrder> wrapper = new LambdaQueryWrapper<MembershipOrder>()
                .eq(StringUtils.hasText(status), MembershipOrder::getStatus, status)
                .orderByDesc(MembershipOrder::getCreateTime);
        return Result.success(orderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    // ============ 系统配置 ============

    @GetMapping("/config")
    public Result<Map<String, Object>> getConfig() {
        // TODO: 从数据库/Redis 读取配置
        return Result.success(Map.of(
                "membershipPrices", List.of(),
                "featureToggles", List.of()
        ));
    }

    @PutMapping("/config")
    public Result<Void> updateConfig(@RequestBody Map<String, Object> config) {
        // TODO: 保存配置
        return Result.success();
    }

    // ============ 操作日志 ============

    @GetMapping("/logs")
    public Result<IPage<Object>> getLogs(
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        // TODO: AdminOperationLogMapper 实现后替换
        return Result.success(new Page<>(pageNum, pageSize));
    }

    // ---- inner types ----

    @Data
    static class NoteRequest { private String note; }

    @Data
    static class HandleReportRequest { private String action; private String note; }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setNickname(u.getNickname());
        dto.setPhone(u.getPhone());
        dto.setRole(u.getRole());
        dto.setStatus(u.getStatus());
        dto.setInstitutionId(u.getInstitutionId());
        dto.setCreateTime(u.getCreateTime() != null ? u.getCreateTime().toString() : null);
        return dto;
    }

    @Data
    static class UserDTO {
        private Long id;
        private String nickname;
        private String phone;
        private String role;
        private Integer status;
        private Long institutionId;
        private String institutionName;
        private String createTime;
    }
}
