import { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { Button, Tag } from 'antd'
import { ImportOutlined } from '@ant-design/icons'
import { StudentDTO, getStudents, importStudents, downloadStudentTemplate } from '@/api/principal'
import BatchImportModal from '@/components/BatchImportModal'

export default function PrincipalStudents() {
  const actionRef = useRef<ActionType>()
  const [importOpen, setImportOpen] = useState(false)

  const columns: ProColumns<StudentDTO>[] = [
    { title: 'ID', dataIndex: 'id', width: 70, search: false },
    { title: '昵称', dataIndex: 'nickname' },
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
      <ProTable<StudentDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="学生管理"
        request={async (params) => {
          const res = await getStudents({ keyword: params.nickname, pageNum: params.current, pageSize: params.pageSize })
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
        title="学生"
        onClose={() => setImportOpen(false)}
        onSuccess={() => actionRef.current?.reload()}
        onDownloadTemplate={downloadStudentTemplate as () => Promise<unknown>}
        onImport={importStudents}
      />
    </>
  )
}
