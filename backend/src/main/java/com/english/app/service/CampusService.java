package com.english.app.service;

import com.english.app.entity.Campus;

import java.util.List;

public interface CampusService {
    List<Campus> getCampusList();
    Campus getCampusById(Long id);
    void createCampus(Campus campus);
    void updateCampus(Campus campus);
    void deleteCampus(Long id);
}
