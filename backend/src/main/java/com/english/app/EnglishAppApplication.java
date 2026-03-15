package com.english.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.english.app.mapper")
public class EnglishAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(EnglishAppApplication.class, args);
    }
}
