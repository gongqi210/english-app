import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
      <Result
        status="info"
        title={title}
        subTitle={description || '该模块正在开发中，敬请期待'}
      />
    </div>
  )
}
