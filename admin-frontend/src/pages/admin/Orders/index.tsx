import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'
import { OrderDTO, getOrders } from '@/api/admin'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'default' },
  success: { label: '已支付', color: 'success' },
  failed: { label: '支付失败', color: 'error' },
  refunded: { label: '已退款', color: 'warning' },
}

export default function AdminOrders() {
  const columns: ProColumns<OrderDTO>[] = [
    { title: '订单号', dataIndex: 'orderNo', width: 200, copyable: true },
    { title: '用户', dataIndex: 'userNickname', width: 120 },
    { title: '会员等级', dataIndex: 'levelName', width: 110, search: false },
    {
      title: '金额', dataIndex: 'amount', width: 100, search: false, align: 'right',
      render: (v) => `¥${((v as number) / 100).toFixed(2)}`,
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      valueEnum: Object.fromEntries(Object.entries(STATUS_MAP).map(([k, v]) => [k, v.label])),
      render: (_, r) => { const s = STATUS_MAP[r.status] ?? { label: r.status, color: 'default' }; return <Tag color={s.color}>{s.label}</Tag> },
    },
    { title: '支付时间', dataIndex: 'payTime', width: 180, search: false },
    { title: '下单时间', dataIndex: 'createTime', width: 180, search: false },
  ]

  return (
    <ProTable<OrderDTO>
      rowKey="id"
      columns={columns}
      headerTitle="财务订单"
      request={async (params) => {
        const res = await getOrders({ status: params.status, pageNum: params.current, pageSize: params.pageSize })
        return { data: res.data.records, total: res.data.total, success: true }
      }}
      pagination={{ pageSize: 20 }}
      cardBordered
    />
  )
}
