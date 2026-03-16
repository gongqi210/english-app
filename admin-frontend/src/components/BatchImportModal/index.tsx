import { useState } from 'react'
import { Alert, Button, Modal, Space, Steps, Table, Tag, Upload, message } from 'antd'
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'

export interface ImportError {
  row: number
  message: string
}

interface Props {
  open: boolean
  title: string
  onClose: () => void
  onSuccess: () => void
  onDownloadTemplate: () => Promise<unknown>
  onImport: (file: File) => Promise<{ data: { success: number; failed: number; errors: ImportError[] } }>
}

const { Dragger } = Upload

export default function BatchImportModal({ open, title, onClose, onSuccess, onDownloadTemplate, onImport }: Props) {
  const [step, setStep] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [importing, setImporting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: ImportError[] } | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await onDownloadTemplate() as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}导入模板.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = async () => {
    const file = fileList[0]?.originFileObj
    if (!file) { message.warning('请先选择文件'); return }
    setImporting(true)
    try {
      const res = await onImport(file)
      setResult(res.data)
      setStep(1)
      if (res.data.failed === 0) message.success(`导入成功，共 ${res.data.success} 条`)
      else message.warning(`导入完成：成功 ${res.data.success}，失败 ${res.data.failed}`)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setStep(0); setFileList([]); setResult(null)
    onClose()
    if (result && result.success > 0) onSuccess()
  }

  return (
    <Modal
      title={`批量导入${title}`}
      open={open}
      onCancel={handleClose}
      width={580}
      footer={
        step === 0
          ? <Space><Button onClick={handleClose}>取消</Button><Button type="primary" loading={importing} disabled={!fileList.length} onClick={handleImport}>开始导入</Button></Space>
          : <Button type="primary" onClick={handleClose}>{result?.failed === 0 ? '完成' : '关闭'}</Button>
      }
    >
      <Steps current={step} items={[{ title: '选择文件' }, { title: '导入结果' }]} size="small" style={{ marginBottom: 20 }} />

      {step === 0 && (
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Alert type="info" message={<>第一步：<Button type="link" size="small" icon={<DownloadOutlined />} loading={downloading} onClick={handleDownload} style={{ padding: 0 }}>下载模板</Button>，按格式填写后上传</>} />
          <Dragger accept=".xlsx,.xls" maxCount={1} fileList={fileList} beforeUpload={() => false} onChange={({ fileList: fl }) => setFileList(fl)}>
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此处</p>
          </Dragger>
        </Space>
      )}

      {step === 1 && result && (
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Space>
            <Tag color="success">成功：{result.success}</Tag>
            <Tag color={result.failed > 0 ? 'error' : 'default'}>失败：{result.failed}</Tag>
          </Space>
          {result.errors.length > 0 && (
            <Table dataSource={result.errors} rowKey="row" size="small" pagination={false} scroll={{ y: 200 }}
              columns={[{ title: '行号', dataIndex: 'row', width: 70 }, { title: '错误信息', dataIndex: 'message' }]} />
          )}
        </Space>
      )}
    </Modal>
  )
}
