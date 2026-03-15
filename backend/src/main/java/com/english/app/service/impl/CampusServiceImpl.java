package com.english.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.entity.Campus;
import com.english.app.mapper.CampusMapper;
import com.english.app.service.CampusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampusServiceImpl implements CampusService {

    private final CampusMapper campusMapper;

    @Override
    public List<Campus> getCampusList() {
        return campusMapper.selectList(
            new LambdaQueryWrapper<Campus>()
                .eq(Campus::getStatus, 1)
                .orderByDesc(Campus::getCreateTime)
        );
    }

    @Override
    public Campus getCampusById(Long id) {
        return campusMapper.selectById(id);
    }

    @Override
    public void createCampus(Campus campus) {
        campus.setStatus(1);
        campusMapper.insert(campus);
    }

    @Override
    public void updateCampus(Campus campus) {
        campusMapper.updateById(campus);
    }

    @Override
    public void deleteCampus(Long id) {
        Campus campus = new Campus();
        campus.setId(id);
        campus.setStatus(0);
        campusMapper.updateById(campus);
    }
}
