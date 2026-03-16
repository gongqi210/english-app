import { useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Popconfirm, Space, Tag, message, Modal } from 'antd'
import { AdminUser, getAdminUsers, banUser, unbanUser, resetPassword } from '@/api/admin'

const ROLE_LABEL: Record<string, string> = { student: '学生', parent: '家长', teacher: '老师', principal: '分校长', head_principal: '总校长', admin: '运营' }

export default function AdminUsers() {
  const actionRef = useRef<ActionType>()

  const handleBan = async (id: number) => {
    await banUser(id); message.success('已封号'); actionRef.current?.reload()
  }
  const handleUnban = async (id: number) => {
    await unbanUser(id); message.success('已解封'); actionRef.current?.reload()
  }
  const handleReset = async (id: number) => {
    const res = await resetPassword(id)
    Modal.success({ title: '密码已重置', content: `新密码：${res.data.newPassword}`, okText: '已复制' })
  }

  const columns: ProColumns<AdminUser>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '手机号', dataIndex: 'phone', search: false },
    {
      title: '角色', dataIndex: 'role', width: 90,
      valueEnum: Object.fromEntries(Object.entries(ROLE_LABEL).map(([k, v]) => [k, v])),
      render: (_, r) => <Tag>{ROLE_LABEL[r.role] ?? r.role}</Tag>,
    },
    { title: '所属机构', dataIndex: 'institutionName', search: false, ellipsis: true },
    {
      title: '状态', dataIndex: 'status', width: 80,
      valueEnum: { 1: '正常', 0: '已封号' },
      render: (_, r) => <Tag color={r.status === 1 ? 'success' : 'error'}>{r.status === 1 ? '正常' : '已封号'}</Tag>,
    },
    { title: '注册时间', dataIndex: 'createTime', width: 180, search: false },
    {
      title: '操作', width: 200, search: false,
      render: (_, r) => (
        <Space size={4}>
          {r.status === 1
            ? <Popconfirm title="确定封禁该用户？" onConfirm={() => handleBan(r.id)} okType="danger" okText="封禁">
                <Button type="link" size="small" danger>封号</Button>
              </Popconfirm>
            : <Popconfirm title="确定解封该用户？" onConfirm={() => handleUnban(r.id)}>
                <Button type="link" size="small" style={{ color: '#52c41a' }}>解封</Button>
              </Popconfirm>
          }
          <Popconfirm title="重置密码后将显示新密码，确认？" onConfirm={() => handleReset(r.id)}>
            <Button type="link" size="small">重置密码</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <ProTable<AdminUser>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      headerTitle="用户管理"
      request={async (params) => {
        const res = await getAdminUsers({ keyword: params.nickname, role: params.role, status: params.status, pageNum: params.current, pageSize: params.pageSize })
        return { data: res.data.records, total: res.data.total, success: true }
      }}
      pagination={{ pageSize: 20 }}
      cardBordered
    />
  )
}
