import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Popconfirm, Space, Tag, message } from 'antd'
import {
  PlusOutlined,
  ImportOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { Question, deleteQuestion, copyQuestion, getQuestions } from '@/api/teacher'
import QuestionForm from './QuestionForm'
import ImportModal from './ImportModal'

const QUESTION_TYPES = [
  { label: '选择题', value: 'choice' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: '语音题', value: 'voice' },
  { label: '阅读题', value: 'reading' },
  { label: '翻译题', value: 'translate' },
  { label: '作文题', value: 'essay' },
]

const TYPE_COLOR: Record<string, string> = {
  choice: 'blue',
  fill: 'cyan',
  judge: 'green',
  voice: 'purple',
  reading: 'orange',
  translate: 'geekblue',
  essay: 'red',
}

const DIFFICULTY_LABEL = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']

export default function TeacherQuestions() {
  const actionRef = useRef<ActionType>()
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Question | undefined>()
  const [importOpen, setImportOpen] = useState(false)

  const handleEdit = (record: Question) => {
    setEditRecord(record)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteQuestion(id)
      message.success('已删除')
      actionRef.current?.reload()
    } catch {
      //
    }
  }

  const handleCopy = async (id: number) => {
    try {
      await copyQuestion(id)
      message.success('复制成功')
      actionRef.current?.reload()
    } catch {
      //
    }
  }

  const columns: ProColumns<Question>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
      search: false,
    },
    {
      title: '题型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      fieldProps: { options: QUESTION_TYPES },
      render: (_, record) => (
        <Tag color={TYPE_COLOR[record.type] || 'default'}>{record.typeName}</Tag>
      ),
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      ellipsis: true,
      search: false,
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: { placeholder: '搜索题目内容' },
    },
    {
      title: '知识点',
      dataIndex: 'knowledgePoint',
      width: 120,
      ellipsis: true,
      search: false,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 110,
      search: false,
      render: (_, record) => DIFFICULTY_LABEL[record.difficulty] || '-',
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 90,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      search: false,
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'success' : 'default'}>
          {record.status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 160,
      search: false,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record.id)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定删除这道题吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            okType="danger"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <ProTable<Question>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="题目管理"
        request={async (params) => {
          const res = await getQuestions({
            type: params.type,
            keyword: params.keyword,
            pageNum: params.current,
            pageSize: params.pageSize,
          })
          return {
            data: res.data.records,
            total: res.data.total,
            success: true,
          }
        }}
        toolBarRender={() => [
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => setImportOpen(true)}
          >
            批量导入
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(undefined)
              setFormOpen(true)
            }}
          >
            新建题目
          </Button>,
        ]}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 900 }}
        cardBordered
      />

      <QuestionForm
        open={formOpen}
        record={editRecord}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false)
          actionRef.current?.reload()
        }}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false)
          actionRef.current?.reload()
        }}
      />
    </>
  )
}
