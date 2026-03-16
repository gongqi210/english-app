import { useEffect } from 'react'
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Question, CreateQuestionRequest, createQuestion, updateQuestion } from '@/api/teacher'
import ImageUpload from '@/components/ImageUpload'

interface Props {
  open: boolean
  record?: Question
  onClose: () => void
  onSuccess: () => void
}

const QUESTION_TYPES = [
  { label: '选择题', value: 'choice' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: '语音题', value: 'voice' },
  { label: '阅读题', value: 'reading' },
  { label: '翻译题', value: 'translate' },
  { label: '作文题', value: 'essay' },
]

export default function QuestionForm({ open, record, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const isEdit = !!record

  const watchType = Form.useWatch('type', form)
  const isChoice = watchType === 'choice' || watchType === 'judge'

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          ...record,
          options: record.options?.length
            ? record.options
            : [{ key: 'A', value: '' }, { key: 'B', value: '' }],
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          difficulty: 3,
          type: 'choice',
          options: [
            { key: 'A', value: '' },
            { key: 'B', value: '' },
            { key: 'C', value: '' },
            { key: 'D', value: '' },
          ],
        })
      }
    }
  }, [open, record, form])

  const onFinish = async (values: CreateQuestionRequest & { options: { key: string; value: string }[] }) => {
    try {
      if (isEdit) {
        await updateQuestion(record!.id, values)
        message.success('更新成功')
      } else {
        await createQuestion(values)
        message.success('创建成功')
      }
      onSuccess()
    } catch {
      //
    }
  }

  return (
    <Drawer
      title={isEdit ? '编辑题目' : '新建题目'}
      open={open}
      onClose={onClose}
      width={640}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            保存
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="type" label="题型" rules={[{ required: true }]}>
          <Select options={QUESTION_TYPES} />
        </Form.Item>

        <Form.Item name="content" label="题目内容" rules={[{ required: true, message: '请输入题目内容' }]}>
          <Input.TextArea rows={4} placeholder="输入题目正文" showCount maxLength={2000} />
        </Form.Item>

        <Form.Item name="imageUrl" label="题目图片（可选）">
          <ImageUpload />
        </Form.Item>

        {/* 选择题 / 判断题 选项 */}
        {isChoice && (
          <Form.Item label="选项">
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        name={[field.name, 'key']}
                        noStyle
                        rules={[{ required: true }]}
                      >
                        <Input style={{ width: 60 }} placeholder="A" />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'value']}
                        noStyle
                        rules={[{ required: true, message: '请输入选项内容' }]}
                      >
                        <Input style={{ width: 380 }} placeholder={`选项 ${index + 1}`} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#ff4d4f' }} />
                      )}
                    </Space>
                  ))}
                  {fields.length < 6 && (
                    <Button
                      type="dashed"
                      onClick={() => add({ key: String.fromCharCode(65 + fields.length), value: '' })}
                      icon={<PlusOutlined />}
                      size="small"
                    >
                      添加选项
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </Form.Item>
        )}

        <Form.Item name="correctKey" label={isChoice ? '正确答案（填选项字母）' : '参考答案'}>
          <Input placeholder={isChoice ? '如: A 或 AB（多选）' : '输入参考答案'} />
        </Form.Item>

        <Form.Item name="difficulty" label="难度（1-5）" rules={[{ required: true }]}>
          <InputNumber min={1} max={5} style={{ width: 120 }} />
        </Form.Item>

        <Form.Item name="knowledgePoint" label="知识点">
          <Input placeholder="如：现在进行时" />
        </Form.Item>

        <Form.Item name="tags" label="标签（逗号分隔）">
          <Input placeholder="如：语法,初级" />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
