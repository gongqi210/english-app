import { useEffect, useRef, useState } from 'react'
import { Button, Image, Space, Spin, Tooltip, message } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import ScreenshotTool from '@/components/ScreenshotTool'
import { uploadImage } from '@/api/teacher'

interface Props {
  value?: string          // 当前图片 URL
  onChange?: (url: string | undefined) => void
}

/**
 * 统一图片上传组件
 * 支持三种方式：
 * 1. 点击上传（文件选择）
 * 2. Ctrl+V 粘贴剪贴板图片
 * 3. 截图工具（屏幕区域捕获）
 */
export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 监听 Ctrl+V 粘贴
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // 仅当容器或其子元素聚焦时响应
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            handleUpload(file)
          }
          break
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleUpload = async (file: File) => {
    // 限制 10MB
    if (file.size > 10 * 1024 * 1024) {
      message.error('图片不能超过 10MB')
      return
    }
    setUploading(true)
    try {
      const res = await uploadImage(file)
      onChange?.(res.data.url)
      message.success('图片上传成功')
    } catch {
      // error handled in request interceptor
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // 清空 input，允许再次选同一文件
    e.target.value = ''
  }

  const handleRemove = () => onChange?.(undefined)

  return (
    <div ref={containerRef}>
      {value ? (
        <Space direction="vertical" size={8}>
          <Image
            src={value}
            width={240}
            style={{ borderRadius: 6, border: '1px solid #e8e8e8' }}
            preview={{ mask: '预览' }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            删除图片
          </Button>
        </Space>
      ) : (
        <Spin spinning={uploading} tip="上传中...">
          <Space wrap>
            {/* 文件选择 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Tooltip title="支持 JPG、PNG、GIF，不超过 10MB">
              <Button
                icon={<UploadOutlined />}
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                选择图片
              </Button>
            </Tooltip>

            {/* 截图工具 */}
            <ScreenshotTool onCapture={handleUpload} />

            <span style={{ color: '#999', fontSize: 12 }}>
              或 Ctrl+V 粘贴剪贴板图片
            </span>
          </Space>
        </Spin>
      )}
    </div>
  )
}
