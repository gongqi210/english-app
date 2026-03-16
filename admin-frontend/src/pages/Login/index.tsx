import { useState } from 'react'
import { Form, Input, Button, Select, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/store/auth'
import { adminLogin } from '@/api/auth'
import styles from './index.module.css'

const { Title, Text } = Typography

const ROLE_OPTIONS = [
  { label: '老师', value: 'teacher' },
  { label: '分校长', value: 'principal' },
  { label: '总校长', value: 'head_principal' },
  { label: '运营管理员', value: 'admin' },
]

// 角色对应的默认首页
const ROLE_HOME: Record<UserRole, string> = {
  teacher: '/teacher/questions',
  principal: '/principal/dashboard',
  head_principal: '/principal/dashboard',
  admin: '/admin/institutions',
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const onFinish = async (values: { username: string; password: string; role: UserRole }) => {
    setLoading(true)
    try {
      const result = await adminLogin({
        code: values.username,
        password: values.password,
        role: values.role,
      })
      const userData = result.data
      setAuth({ ...userData, role: values.role })
      message.success(`欢迎回来，${userData.nickname || values.username}`)
      navigate(ROLE_HOME[values.role])
    } catch {
      // 错误已在 request 拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            英语学习平台
          </Title>
          <Text type="secondary">管理后台</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ role: 'teacher' }}
        >
          <Form.Item name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={ROLE_OPTIONS} placeholder="选择登录角色" />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名 / 手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
