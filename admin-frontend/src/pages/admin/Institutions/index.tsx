import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Modal, Form, Input, Popconfirm, Space, Tag, message } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { InstitutionApplication, getApplications, approveApplication, rejectApplication } from '@/api/admin'

const STATUS_MAP = { pending: { label: '待审核', color: 'processing' }, approved: { label: '已通过', color: 'success' }, rejected: { label: '已拒绝', color: 'error' } }

export default function AdminInstitutions() {
  const actionRef = useRef<ActionType>()
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: number }>({ open: false })
  const [form] = Form.useForm()

  const handleApprove = async (id: number) => {
    await approveApplication(id)
    message.success('已通过，请手动配置账号')
    actionRef.current?.reload()
  }

  const handleReject = async () => {
    const { note } = await form.validateFields()
    await rejectApplication(rejectModal.id!, note)
    message.success('已拒绝')
    setRejectModal({ open: false })
    form.resetFields()
    actionRef.current?.reload()
  }

  const columns: ProColumns<InstitutionApplication>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '机构名称', dataIndex: 'name' },
    { title: '联系人', dataIndex: 'contact', width: 100, search: false },
    { title: '电话', dataIndex: 'phone', width: 130, search: false },
    { title: '地址', dataIndex: 'address', ellipsis: true, search: false },
    { title: '申请说明', dataIndex: 'remark', ellipsis: true, search: false },
    {
      title: '状态', dataIndex: 'status', width: 90,
      valueEnum: { pending: '待审核', approved: '已通过', rejected: '已拒绝' },
      render: (_, r) => { const s = STATUS_MAP[r.status]; return <Tag color={s.color}>{s.label}</Tag> },
    },
    { title: '申请时间', dataIndex: 'createTime', width: 180, search: false },
    {
      title: '操作', width: 160, search: false,
      render: (_, r) => r.status !== 'pending' ? null : (
        <Space size={4}>
          <Popconfirm title="确定通过该机构申请？" onConfirm={() => handleApprove(r.id)}>
            <Button type="link" size="small" icon={<CheckOutlined />} style={{ color: '#52c41a' }}>通过</Button>
          </Popconfirm>
          <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => setRejectModal({ open: true, id: r.id })}>拒绝</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <ProTable<InstitutionApplication>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="机构入驻管理"
        request={async (params) => {
          const res = await getApplications({ status: params.status, pageNum: params.current, pageSize: params.pageSize })
          return { data: res.data.records, total: res.data.total, success: true }
        }}
        pagination={{ pageSize: 20 }}
        cardBordered
      />

      <Modal title="拒绝申请" open={rejectModal.open} onCancel={() => { setRejectModal({ open: false }); form.resetFields() }} onOk={handleReject} okText="确认拒绝" okButtonProps={{ danger: true }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="note" label="拒绝原因" rules={[{ required: true, message: '请填写拒绝原因' }]}>
            <Input.TextArea rows={3} placeholder="请说明拒绝原因，将告知申请方" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
