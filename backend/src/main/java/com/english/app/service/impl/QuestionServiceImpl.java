package com.english.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.app.dto.CreateQuestionRequest;
import com.english.app.dto.QuestionDTO;
import com.english.app.entity.Question;
import com.english.app.mapper.QuestionMapper;
import com.english.app.service.JwtService;
import com.english.app.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
        "fill_blank", "填空题",
        "listening", "听力题",
        "tracing", "描红题",
        "handwriting", "手写题",
        "reading", "跟读题",
        "matching", "连线题"
    );

    @Override
    public List<QuestionDTO> getQuestions(String type, String keyword) {
        LambdaQueryWrapper<Question> wrapper = new LambdaQueryWrapper<Question>()
            .eq(Question::getStatus, 1)
            .eq(StringUtils.hasText(type) && !"all".equals(type), Question::getType, type)
            .like(StringUtils.hasText(keyword), Question::getContent, keyword)
            .orderByDesc(Question::getCreateTime);

        return questionMapper.selectList(wrapper).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public QuestionDTO createQuestion(CreateQuestionRequest request) {
        Long userId = jwtService.getCurrentUserId();

        Question question = new Question();
        question.setType(request.getType());
        question.setContent(request.getContent());
        question.setAnswer(request.getAnswer());
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

    private QuestionDTO toDTO(Question q) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(q.getId());
        dto.setType(q.getType());
        dto.setTypeName(TYPE_NAME_MAP.getOrDefault(q.getType(), q.getType()));
        dto.setContent(q.getContent());
        dto.setDifficulty(q.getDifficulty());
        dto.setUsageCount(0);
        return dto;
    }
}
