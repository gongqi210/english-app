package com.english.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.english.app.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
