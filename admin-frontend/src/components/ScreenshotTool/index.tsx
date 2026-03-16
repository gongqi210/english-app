import { useRef, useState, useCallback } from 'react'
import { Button, message, Spin } from 'antd'
import { ScissorOutlined } from '@ant-design/icons'

interface Props {
  onCapture: (file: File) => void
}

interface Selection {
  startX: number
  startY: number
  endX: number
  endY: number
}

/**
 * 截图工具：
 * 1. 调用 getDisplayMedia 捕获屏幕帧
 * 2. 在全屏覆盖层中展示截图
 * 3. 用户拖拽选择区域
 * 4. 裁剪并返回 File
 */
export default function ScreenshotTool({ onCapture }: Props) {
  const [capturing, setCapturing] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(null)

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const selectionRef = useRef<Selection | null>(null)
  const screenshotImageRef = useRef<ImageBitmap | null>(null)

  const startCapture = useCallback(async () => {
    setCapturing(true)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false,
      })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      // 等一帧确保视频渲染
      await new Promise((r) => requestAnimationFrame(r))

      const bitmap = await createImageBitmap(video)
      screenshotImageRef.current = bitmap

      // 停止捕获流
      stream.getTracks().forEach((t) => t.stop())
      video.remove()

      setOverlayVisible(true)

      // 下一帧绘制到 canvas
      requestAnimationFrame(() => {
        const canvas = overlayCanvasRef.current
        if (!canvas) return
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        // 半透明蒙层
        ctx.fillStyle = 'rgba(0,0,0,0.45)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        message.error('截图失败：' + err.message)
      }
    } finally {
      setCapturing(false)
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayCanvasRef.current!.getBoundingClientRect()
    const sel = {
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    }
    selectionRef.current = sel
    setSelection(sel)
    setSelecting(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selecting || !selectionRef.current) return
      const rect = overlayCanvasRef.current!.getBoundingClientRect()
      const updated = {
        ...selectionRef.current,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      }
      selectionRef.current = updated
      setSelection({ ...updated })

      // 重绘覆盖层 + 选区
      const canvas = overlayCanvasRef.current!
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (screenshotImageRef.current) {
        ctx.drawImage(screenshotImageRef.current, 0, 0, canvas.width, canvas.height)
      }
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const x = Math.min(updated.startX, updated.endX)
      const y = Math.min(updated.startY, updated.endY)
      const w = Math.abs(updated.endX - updated.startX)
      const h = Math.abs(updated.endY - updated.startY)

      // 清除选区蒙层，露出原始截图
      ctx.clearRect(x, y, w, h)
      if (screenshotImageRef.current) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.clip()
        ctx.drawImage(screenshotImageRef.current, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      // 选区边框
      ctx.strokeStyle = '#1677ff'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)
    },
    [selecting],
  )

  const handleMouseUp = useCallback(() => {
    if (!selecting || !selectionRef.current) return
    setSelecting(false)

    const sel = selectionRef.current
    const x = Math.min(sel.startX, sel.endX)
    const y = Math.min(sel.startY, sel.endY)
    const w = Math.abs(sel.endX - sel.startX)
    const h = Math.abs(sel.endY - sel.startY)

    if (w < 10 || h < 10) {
      message.warning('选区太小，请重新截取')
      return
    }

    // 裁剪选区
    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = w
    cropCanvas.height = h
    const ctx = cropCanvas.getContext('2d')!
    if (screenshotImageRef.current) {
      // 将屏幕坐标映射到截图坐标（截图可能比窗口大）
      const scaleX = screenshotImageRef.current.width / window.innerWidth
      const scaleY = screenshotImageRef.current.height / window.innerHeight
      ctx.drawImage(
        screenshotImageRef.current,
        x * scaleX,
        y * scaleY,
        w * scaleX,
        h * scaleY,
        0,
        0,
        w,
        h,
      )
    }

    cropCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
        onCapture(file)
      }
    }, 'image/png')

    setOverlayVisible(false)
    screenshotImageRef.current = null
    selectionRef.current = null
    setSelection(null)
  }, [selecting, onCapture])

  const handleCancel = useCallback(() => {
    setOverlayVisible(false)
    screenshotImageRef.current = null
    selectionRef.current = null
    setSelection(null)
    setSelecting(false)
  }, [])

  return (
    <>
      <Button
        icon={<ScissorOutlined />}
        onClick={startCapture}
        loading={capturing}
        size="small"
      >
        截图
      </Button>

      {overlayVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'crosshair',
          }}
        >
          <canvas
            ref={overlayCanvasRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              pointerEvents: 'none',
            }}
          >
            拖拽选择截图区域 · 按 ESC 取消
          </div>
          <Button
            danger
            size="small"
            style={{ position: 'absolute', top: 12, right: 16 }}
            onClick={handleCancel}
          >
            取消
          </Button>
        </div>
      )}
    </>
  )
}
