import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'
import { OperationLog, getLogs } from '@/api/admin'

const ACTION_COLOR: Record<string, string> = {
  BAN_USER: 'red', UNBAN_USER: 'green', RESET_PASSWORD: 'orange',
  APPROVE_APP: 'blue', REJECT_APP: 'default', TAKEDOWN_CONTENT: 'red',
  UPDATE_CONFIG: 'purple',
}

export default function AdminLogs() {
  const columns: ProColumns<OperationLog>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '操作人', dataIndex: 'operatorNickname', width: 120 },
    { title: '角色', dataIndex: 'operatorRole', width: 90, search: false },
    {
      title: '操作类型', dataIndex: 'action', width: 140,
      render: (v) => <Tag color={ACTION_COLOR[v as string] ?? 'default'}>{v as string}</Tag>,
    },
    { title: '对象类型', dataIndex: 'targetType', width: 100, search: false },
    { title: '对象ID', dataIndex: 'targetId', width: 80, search: false },
    { title: '详情', dataIndex: 'detail', ellipsis: true, search: false },
    { title: 'IP', dataIndex: 'ip', width: 130, search: false },
    { title: '操作时间', dataIndex: 'createTime', width: 180, search: false },
  ]

  return (
    <ProTable<OperationLog>
      rowKey="id"
      columns={columns}
      headerTitle="操作日志"
      request={async (params) => {
        const res = await getLogs({ action: params.action, pageNum: params.current, pageSize: params.pageSize })
        return { data: res.data.records, total: res.data.total, success: true }
      }}
      pagination={{ pageSize: 20 }}
      cardBordered
    />
  )
}
