package com.english.app.controller;

import com.english.app.entity.Institution;
import com.english.app.entity.InstitutionApplication;
import com.english.app.mapper.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean InstitutionApplicationMapper applicationMapper;
    @MockBean ContentReportMapper reportMapper;
    @MockBean com.english.app.mapper.MembershipOrderMapper orderMapper;
    @MockBean InstitutionMapper institutionMapper;
    @MockBean com.english.app.mapper.UserMapper userMapper;
    @MockBean PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("入驻申请列表 - 返回分页数据")
    void getApplications_returnsPaged() throws Exception {
        Page<InstitutionApplication> page = new Page<>(1, 20);
        page.setTotal(0);
        when(applicationMapper.selectPage(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/admin/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(0));
    }

    @Test
    @DisplayName("审核通过 - 申请不存在返回错误")
    void approveApplication_notFound() throws Exception {
        when(applicationMapper.selectById(999L)).thenReturn(null);

        mockMvc.perform(post("/api/admin/applications/999/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    @DisplayName("审核通过 - 创建机构并更新申请状态")
    void approveApplication_success() throws Exception {
        InstitutionApplication app = new InstitutionApplication();
        app.setId(1L);
        app.setName("石榴街英语");
        app.setContact("张总");
        app.setPhone("13800000001");
        app.setStatus("pending");

        when(applicationMapper.selectById(1L)).thenReturn(app);
        when(applicationMapper.updateById(any())).thenReturn(1);
        when(institutionMapper.insert(any())).thenReturn(1);

        mockMvc.perform(post("/api/admin/applications/1/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("note", "资质齐全"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(institutionMapper).insert(argThat(i -> "石榴街英语".equals(((Institution) i).getName())));
    }

    @Test
    @DisplayName("已入驻机构列表 - 正常返回")
    void getInstitutions_ok() throws Exception {
        when(institutionMapper.selectPage(any(), any())).thenReturn(new Page<>(1, 20));

        mockMvc.perform(get("/api/admin/institutions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
