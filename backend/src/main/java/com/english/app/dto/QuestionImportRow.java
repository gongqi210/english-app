package com.english.app.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

/**
 * 批量导入题目 Excel 行映射
 * 列顺序：题型 | 题目内容 | 选项A | 选项B | 选项C | 选项D | 正确答案 | 难度(1-5) | 知识点
 */
@Data
public class QuestionImportRow {

    @ExcelProperty("题型")
    private String type;

    @ExcelProperty("题目内容")
    private String content;

    @ExcelProperty("选项A")
    private String optionA;

    @ExcelProperty("选项B")
    private String optionB;

    @ExcelProperty("选项C")
    private String optionC;

    @ExcelProperty("选项D")
    private String optionD;

    @ExcelProperty("正确答案")
    private String correctKey;

    @ExcelProperty("难度(1-5)")
    private Integer difficulty;

    @ExcelProperty("知识点")
    private String knowledgePoint;
}
