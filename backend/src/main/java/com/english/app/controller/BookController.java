package com.english.app.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.common.Result;
import com.english.app.entity.Book;
import com.english.app.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * 获取绘本列表（分页）
     * GET /api/books?page=1&pageSize=10&level=A&keyword=xxx
     */
    @GetMapping
    public Result<Page<Book>> getList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort
    ) {
        // sort=popular 按评分排序
        Page<Book> result = bookService.getList(page, pageSize, level, keyword);
        return Result.success(result);
    }

    /**
     * 获取推荐绘本
     * GET /api/books/recommend
     */
    @GetMapping("/recommend")
    public Result<List<Book>> getRecommend(@RequestParam(defaultValue = "4") Integer limit) {
        List<Book> books = bookService.getRecommend(limit);
        return Result.success(books);
    }

    /**
     * 获取最近学习的绘本
     * GET /api/books/recent
     */
    @GetMapping("/recent")
    public Result<List<Book>> getRecent(@RequestParam(defaultValue = "6") Integer limit) {
        List<Book> books = bookService.getRecent(limit);
        return Result.success(books);
    }

    /**
     * 获取绘本详情
     * GET /api/books/{id}
     */
    @GetMapping("/{id}")
    public Result<Book> getById(@PathVariable Long id) {
        Book book = bookService.getById(id);
        return Result.success(book);
    }
}
