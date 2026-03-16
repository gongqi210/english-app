import { useRef, useState } from 'react'
import { Alert, Button, Modal, Space, Steps, Table, Tag, Typography, Upload, message } from 'antd'
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { downloadTemplate, importQuestions, ImportResult } from '@/api/teacher'

const { Dragger } = Upload
const { Text } = Typography

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0)  // 0: 选文件, 1: 结果
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadTemplate = async () => {
    setDownloading(true)
    try {
      const blob = await downloadTemplate() as unknown as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '题目批量导入模板.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      //
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = async () => {
    const file = fileList[0]?.originFileObj
    if (!file) {
      message.warning('请先选择 Excel 文件')
      return
    }
    setImporting(true)
    try {
      const res = await importQuestions(file)
      setResult(res.data)
      setStep(1)
      if (res.data.failed === 0) {
        message.success(`导入成功，共 ${res.data.success} 道题`)
      } else {
        message.warning(`导入完成：成功 ${res.data.success} 道，失败 ${res.data.failed} 道`)
      }
    } catch {
      //
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setStep(0)
    setFileList([])
    setResult(null)
    onClose()
    if (result && result.success > 0) onSuccess()
  }

  const errorColumns = [
    { title: '行号', dataIndex: 'row', width: 80 },
    { title: '错误信息', dataIndex: 'message' },
  ]

  return (
    <Modal
      title="批量导入题目"
      open={open}
      onCancel={handleClose}
      width={640}
      footer={
        step === 0 ? (
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <Button
              type="primary"
              loading={importing}
              disabled={fileList.length === 0}
              onClick={handleImport}
            >
              开始导入
            </Button>
          </Space>
        ) : (
          <Button type="primary" onClick={handleClose}>
            {result?.failed === 0 ? '完成' : '关闭'}
          </Button>
        )
      }
    >
      <Steps
        current={step}
        items={[{ title: '选择文件' }, { title: '导入结果' }]}
        style={{ marginBottom: 24 }}
        size="small"
      />

      {step === 0 && (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Alert
            type="info"
            message="操作说明"
            description={
              <ol style={{ margin: 0, paddingLeft: 20, lineHeight: '1.8em' }}>
                <li>点击下方按钮下载 Excel 模板</li>
                <li>按模板格式填写题目数据（每行一道题）</li>
                <li>上传填写好的 Excel 文件，点击「开始导入」</li>
              </ol>
            }
          />
          <Button
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownloadTemplate}
          >
            下载导入模板
          </Button>
          <Dragger
            accept=".xlsx,.xls"
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}  // 阻止自动上传
            onChange={({ fileList: fl }) => setFileList(fl)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此处</p>
            <p className="ant-upload-hint">仅支持 .xlsx / .xls 格式</p>
          </Dragger>
        </Space>
      )}

      {step === 1 && result && (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Space>
            <Tag color="success">成功：{result.success} 道</Tag>
            <Tag color={result.failed > 0 ? 'error' : 'default'}>失败：{result.failed} 道</Tag>
          </Space>
          {result.errors.length > 0 && (
            <>
              <Text type="danger">以下行导入失败：</Text>
              <Table
                dataSource={result.errors}
                columns={errorColumns}
                rowKey="row"
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
              />
            </>
          )}
        </Space>
      )}
    </Modal>
  )
}
