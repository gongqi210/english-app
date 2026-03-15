package com.english.app.controller;

import com.english.app.common.Result;
import com.english.app.entity.Campus;
import com.english.app.service.CampusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
@RequiredArgsConstructor
public class CampusController {

    private final CampusService campusService;

    @GetMapping("/list")
    public Result<List<Campus>> list() {
        return Result.success(campusService.getCampusList());
    }

    @GetMapping("/{id}")
    public Result<Campus> getById(@PathVariable Long id) {
        return Result.success(campusService.getCampusById(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody Campus campus) {
        campusService.createCampus(campus);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Campus campus) {
        campus.setId(id);
        campusService.updateCampus(campus);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        campusService.deleteCampus(id);
        return Result.success();
    }
}
