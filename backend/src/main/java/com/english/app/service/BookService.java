package com.english.app.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.entity.Book;

import java.util.List;

public interface BookService {

    /**
     * 分页查询绘本列表
     */
    Page<Book> getList(Integer page, Integer pageSize, String level, String keyword);

    /**
     * 获取推荐绘本
     */
    List<Book> getRecommend(int limit);

    /**
     * 获取最近学习的绘本
     */
    List<Book> getRecent(int limit);

    /**
     * 获取绘本详情
     */
    Book getById(Long id);
}
