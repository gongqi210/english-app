import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Form, Input, Modal, Space, Tag, message } from 'antd'
import { ContentReport, getReports, handleReport } from '@/api/admin'

export default function AdminReports() {
  const actionRef = useRef<ActionType>()
  const [modal, setModal] = useState<{ open: boolean; id?: number; action?: 'takedown' | 'dismiss' }>({ open: false })
  const [form] = Form.useForm()

  const openModal = (id: number, action: 'takedown' | 'dismiss') => { setModal({ open: true, id, action }); form.resetFields() }

  const handleSubmit = async () => {
    const { note } = await form.validateFields()
    await handleReport(modal.id!, modal.action!, note)
    message.success(modal.action === 'takedown' ? '内容已下架' : '举报已驳回')
    setModal({ open: false })
    actionRef.current?.reload()
  }

  const columns: ProColumns<ContentReport>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '举报人', dataIndex: 'reporterNickname', search: false },
    {
      title: '内容类型', dataIndex: 'contentType', width: 90,
      valueEnum: { question: '题目', book: '绘本' },
      render: (_, r) => <Tag color={r.contentType === 'question' ? 'blue' : 'orange'}>{r.contentType === 'question' ? '题目' : '绘本'}</Tag>,
    },
    { title: '内容ID', dataIndex: 'contentId', width: 90, search: false },
    { title: '举报原因', dataIndex: 'reason', ellipsis: true, search: false },
    {
      title: '状态', dataIndex: 'status', width: 90,
      valueEnum: { pending: '待处理', handled: '已处理', dismissed: '已驳回' },
      render: (_, r) => {
        const map = { pending: { color: 'processing', label: '待处理' }, handled: { color: 'error', label: '已下架' }, dismissed: { color: 'default', label: '已驳回' } }
        const s = map[r.status]
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    { title: '举报时间', dataIndex: 'createTime', width: 180, search: false },
    {
      title: '操作', width: 160, search: false,
      render: (_, r) => r.status !== 'pending' ? null : (
        <Space size={4}>
          <Button type="link" size="small" danger onClick={() => openModal(r.id, 'takedown')}>下架内容</Button>
          <Button type="link" size="small" onClick={() => openModal(r.id, 'dismiss')}>驳回举报</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <ProTable<ContentReport>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="内容举报"
        request={async (params) => {
          const res = await getReports({ status: params.status, pageNum: params.current, pageSize: params.pageSize })
          return { data: res.data.records, total: res.data.total, success: true }
        }}
        pagination={{ pageSize: 20 }}
        cardBordered
      />
      <Modal
        title={modal.action === 'takedown' ? '下架内容' : '驳回举报'}
        open={modal.open}
        onCancel={() => setModal({ open: false })}
        onOk={handleSubmit}
        okText="确认"
        okButtonProps={modal.action === 'takedown' ? { danger: true } : undefined}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="note" label="处理说明" rules={[{ required: true, message: '请填写处理说明' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
