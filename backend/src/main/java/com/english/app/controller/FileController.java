package com.english.app.controller;

import com.english.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

/**
 * 文件上传接口
 * 开发环境：文件存本地，通过 /uploads/** 静态路由访问
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileController {

    @Value("${app.upload.dir:${user.home}/english-app-uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://192.168.8.143:8080}")
    private String baseUrl;

    @PostMapping("/image")
    public Result<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return Result.error("只允许上传图片文件");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return Result.error("图片大小不能超过 10MB");
        }

        // 按日期分目录：uploads/images/2024-01/
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String saveDirPath = uploadDir + "/images/" + dateDir;
        File saveDir = new File(saveDirPath);
        if (!saveDir.exists()) {
            saveDir.mkdirs();
        }

        // 生成唯一文件名
        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : ".jpg";
        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;

        file.transferTo(new File(saveDirPath + "/" + fileName));

        String url = baseUrl + "/uploads/images/" + dateDir + "/" + fileName;
        return Result.success(Map.of("url", url));
    }
}
