package com.english.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.english.app.entity.Book;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BookMapper extends BaseMapper<Book> {
}
