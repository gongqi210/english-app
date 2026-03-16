import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag } from 'antd'
import { ImportOutlined } from '@ant-design/icons'
import { TeacherDTO, getTeachers, importTeachers, downloadTeacherTemplate } from '@/api/principal'
import BatchImportModal from '@/components/BatchImportModal'

export default function PrincipalTeachers() {
  const actionRef = useRef<ActionType>()
  const [importOpen, setImportOpen] = useState(false)

  const columns: ProColumns<TeacherDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '姓名', dataIndex: 'nickname' },
    { title: '手机号', dataIndex: 'phone', search: false },
    { title: '校区', dataIndex: 'campusName', search: false },
    {
      title: '状态', dataIndex: 'status', width: 80, search: false,
      render: (_, r) => <Tag color={r.status === 1 ? 'success' : 'error'}>{r.status === 1 ? '正常' : '已禁用'}</Tag>,
    },
    { title: '加入时间', dataIndex: 'createTime', width: 180, search: false },
  ]

  return (
    <>
      <ProTable<TeacherDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="老师管理"
        request={async (params) => {
          const res = await getTeachers({ keyword: params.nickname, pageNum: params.current, pageSize: params.pageSize })
          return { data: res.data.records, total: res.data.total, success: true }
        }}
        toolBarRender={() => [
          <Button key="import" icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>批量导入</Button>,
        ]}
        pagination={{ pageSize: 20 }}
        cardBordered
      />
      <BatchImportModal
        open={importOpen}
        title="老师"
        onClose={() => setImportOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
        onDownloadTemplate={downloadTeacherTemplate as () => Promise<unknown>}
        onImport={importTeachers}
      />
    </>
  )
}
