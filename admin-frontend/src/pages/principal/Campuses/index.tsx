import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Drawer, Form, Input, InputNumber, Space, Tag, message } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { CampusDTO, getCampuses, updateCampus } from '@/api/principal'

export default function PrincipalCampuses() {
  const actionRef = useRef<ActionType>()
  const [editRecord, setEditRecord] = useState<CampusDTO | null>(null)
  const [form] = Form.useForm()

  const columns: ProColumns<CampusDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '校区名称', dataIndex: 'name' },
    { title: '地址', dataIndex: 'address', search: false, ellipsis: true },
    { title: '联系人', dataIndex: 'contact', width: 100, search: false },
    { title: '电话', dataIndex: 'phone', width: 130, search: false },
    { title: '学生数', dataIndex: 'studentCount', width: 80, search: false, align: 'right' },
    { title: '老师数', dataIndex: 'teacherCount', width: 80, search: false, align: 'right' },
    {
      title: '状态', dataIndex: 'status', width: 80, search: false,
      render: (_, r) => <Tag color={r.status === 1 ? 'success' : 'default'}>{r.status === 1 ? '正常' : '禁用'}</Tag>,
    },
    {
      title: '操作', width: 80, search: false,
      render: (_, record) => (
        <Button type="link" size="small" icon={<EditOutlined />}
          onClick={() => { setEditRecord(record); form.setFieldsValue(record) }}>编辑</Button>
      ),
    },
  ]

  const handleSave = async () => {
    const values = await form.validateFields()
    try {
      await updateCampus(editRecord!.id, values)
      message.success('保存成功')
      setEditRecord(null)
      actionRef.current?.reload()
    } catch {/* handled */}
  }

  return (
    <>
      <ProTable<CampusDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="校区管理"
        request={async () => {
          const res = await getCampuses()
          return { data: res.data, total: res.data.length, success: true }
        }}
        search={false}
        pagination={false}
        cardBordered
      />

      <Drawer
        title="编辑校区"
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        width={480}
        extra={<Space><Button onClick={() => setEditRecord(null)}>取消</Button><Button type="primary" onClick={handleSave}>保存</Button></Space>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="校区名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="contact" label="联系人"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
        </Form>
      </Drawer>
    </>
  )
}
