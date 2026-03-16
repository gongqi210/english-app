package com.english.app.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.app.dto.*;
import com.english.app.entity.Question;
import com.english.app.mapper.QuestionMapper;
import com.english.app.service.JwtService;
import com.english.app.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionMapper questionMapper;
    private final JwtService jwtService;

    private static final Map<String, String> TYPE_NAME_MAP = Map.of(
        "choice", "选择题",
        "fill", "填空题",
        "judge", "判断题",
        "voice", "语音题",
        "reading", "阅读题",
        "translate", "翻译题",
        "essay", "作文题"
    );

    @Override
    public IPage<QuestionDTO> getQuestions(String type, String keyword, int pageNum, int pageSize) {
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<Question>()
            .eq(Question::getStatus, 1)
            .eq(StringUtils.hasText(type) && !"all".equals(type), Question::getType, type)
            .like(StringUtils.hasText(keyword), Question::getContent, keyword)
            .orderByDesc(Question::getCreateTime);

        IPage<Question> page = questionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return page.convert(this::toDTO);
    }

    @Override
    public QuestionDTO createQuestion(CreateQuestionRequest request) {
        Long userId = jwtService.getCurrentUserId();

        Question question = new Question();
        question.setType(request.getType());
        question.setContent(request.getContent());
        question.setAnswer(request.getAnswer());
        question.setImageUrl(request.getImageUrl());
        question.setKnowledgePoint(request.getKnowledgePoint());
        question.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : 1);
        question.setTags(request.getTags());
        question.setCreateBy(userId);
        question.setStatus(1);
        questionMapper.insert(question);

        return toDTO(question);
    }

    @Override
    public QuestionDTO updateQuestion(Long id, CreateQuestionRequest request) {
        Question question = questionMapper.selectById(id);
        if (question == null) throw new RuntimeException("题目不存在");

        question.setType(request.getType());
        question.setContent(request.getContent());
        question.setAnswer(request.getAnswer());
        question.setImageUrl(request.getImageUrl());
        question.setKnowledgePoint(request.getKnowledgePoint());
        if (request.getDifficulty() != null) question.setDifficulty(request.getDifficulty());
        question.setTags(request.getTags());
        questionMapper.updateById(question);

        return toDTO(question);
    }

    @Override
    public void deleteQuestion(Long id) {
        questionMapper.deleteById(id);
    }

    @Override
    public QuestionDTO copyQuestion(Long id) {
        Question original = questionMapper.selectById(id);
        if (original == null) throw new RuntimeException("题目不存在");

        Question copy = new Question();
        copy.setType(original.getType());
        copy.setContent(original.getContent());
        copy.setAnswer(original.getAnswer());
        copy.setImageUrl(original.getImageUrl());
        copy.setKnowledgePoint(original.getKnowledgePoint());
        copy.setDifficulty(original.getDifficulty());
        copy.setTags(original.getTags());
        copy.setCreateBy(jwtService.getCurrentUserId());
        copy.setStatus(1);
        questionMapper.insert(copy);

        return toDTO(copy);
    }

    @Override
    public List<QuestionDTO> getQuestionsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return questionMapper.selectBatchIds(ids).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public ImportResultDTO importQuestions(MultipartFile file) throws IOException {
        Long userId = jwtService.getCurrentUserId();
        List<QuestionImportRow> rows = new ArrayList<>();
        List<ImportResultDTO.ErrorItem> errors = new ArrayList<>();

        EasyExcel.read(file.getInputStream(), QuestionImportRow.class,
            new AnalysisEventListener<QuestionImportRow>() {
                int rowNum = 2; // 第1行是表头，数据从第2行开始

                @Override
                public void invoke(QuestionImportRow row, AnalysisContext ctx) {
                    rows.add(row);
                    rowNum++;
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext ctx) {}
            }
        ).sheet().headRowNumber(1).doRead();

        int success = 0;
        for (int i = 0; i < rows.size(); i++) {
            QuestionImportRow row = rows.get(i);
            int rowNum = i + 2;
            try {
                if (!StringUtils.hasText(row.getContent())) {
                    addError(errors, rowNum, "题目内容不能为空");
                    continue;
                }
                if (!StringUtils.hasText(row.getType())) {
                    addError(errors, rowNum, "题型不能为空");
                    continue;
                }

                Question question = new Question();
                question.setType(normalizeType(row.getType()));
                question.setContent(row.getContent());
                question.setAnswer(row.getCorrectKey());
                question.setKnowledgePoint(row.getKnowledgePoint());
                question.setDifficulty(row.getDifficulty() != null ? row.getDifficulty() : 3);
                question.setCreateBy(userId);
                question.setStatus(1);
                questionMapper.insert(question);
                success++;
            } catch (Exception e) {
                addError(errors, rowNum, e.getMessage());
            }
        }

        ImportResultDTO result = new ImportResultDTO();
        result.setSuccess(success);
        result.setFailed(errors.size());
        result.setErrors(errors);
        return result;
    }

    @Override
    public byte[] buildImportTemplate() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        EasyExcel.write(out, QuestionImportRow.class).sheet("题目导入模板").doWrite(
            List.of(buildSampleRow())
        );
        return out.toByteArray();
    }

    // ---- private helpers ----

    private QuestionImportRow buildSampleRow() {
        QuestionImportRow row = new QuestionImportRow();
        row.setType("选择题");
        row.setContent("What is the capital of the UK?");
        row.setOptionA("London");
        row.setOptionB("Paris");
        row.setOptionC("Berlin");
        row.setOptionD("Rome");
        row.setCorrectKey("A");
        row.setDifficulty(3);
        row.setKnowledgePoint("地理常识");
        return row;
    }

    private String normalizeType(String raw) {
        return switch (raw.trim()) {
            case "选择题" -> "choice";
            case "填空题" -> "fill";
            case "判断题" -> "judge";
            case "语音题" -> "voice";
            case "阅读题" -> "reading";
            case "翻译题" -> "translate";
            case "作文题" -> "essay";
            default -> raw.trim();
        };
    }

    private void addError(List<ImportResultDTO.ErrorItem> errors, int row, String msg) {
        ImportResultDTO.ErrorItem item = new ImportResultDTO.ErrorItem();
        item.setRow(row);
        item.setMessage(msg);
        errors.add(item);
    }

    private QuestionDTO toDTO(Question q) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(q.getId());
        dto.setType(q.getType());
        dto.setTypeName(TYPE_NAME_MAP.getOrDefault(q.getType(), q.getType()));
        dto.setContent(q.getContent());
        dto.setImageUrl(q.getImageUrl());
        dto.setKnowledgePoint(q.getKnowledgePoint());
        dto.setDifficulty(q.getDifficulty());
        dto.setUsageCount(0);
        dto.setStatus(q.getStatus());
        dto.setCreateTime(q.getCreateTime() != null ? q.getCreateTime().toString() : null);
        return dto;
    }
}
