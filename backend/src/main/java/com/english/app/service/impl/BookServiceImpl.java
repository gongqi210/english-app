package com.english.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.entity.Book;
import com.english.app.mapper.BookMapper;
import com.english.app.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookMapper bookMapper;

    @Override
    public Page<Book> getList(Integer page, Integer pageSize, String level, String keyword) {
        Page<Book> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Book::getStatus, 1);

        if (level != null && !level.isEmpty()) {
            wrapper.eq(Book::getLevel, level);
        }

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Book::getTitle, keyword)
                    .or()
                    .like(Book::getDescription, keyword)
            );
        }

        wrapper.orderByDesc(Book::getRating, Book::getCreateTime);

        return bookMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public List<Book> getRecommend(int limit) {
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Book::getStatus, 1)
                .orderByDesc(Book::getRating)
                .last("LIMIT " + limit);
        return bookMapper.selectList(wrapper);
    }

    @Override
    public List<Book> getRecent(int limit) {
        // 按创建时间排序，取最近的
        LambdaQueryWrapper<Book> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Book::getStatus, 1)
                .orderByDesc(Book::getCreateTime)
                .last("LIMIT " + limit);
        return bookMapper.selectList(wrapper);
    }

    @Override
    public Book getById(Long id) {
        return bookMapper.selectById(id);
    }
}
