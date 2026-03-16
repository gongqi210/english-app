import { useEffect, useState } from 'react'
import {
  Button, Card, Col, Divider, Form, InputNumber, Row, Space,
  Switch, Spin, Typography, message,
} from 'antd'
import { SystemConfig, getSystemConfig, updateSystemConfig } from '@/api/admin'

const { Title, Text } = Typography

export default function AdminConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    getSystemConfig().then((res) => {
      setConfig(res.data)
      form.setFieldsValue(res.data)
    }).finally(() => setLoading(false))
  }, [form])

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await updateSystemConfig(values)
      message.success('配置已保存，立即生效')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <Title level={4}>系统配置</Title>
      <Form form={form} layout="vertical" onFinish={handleSave}>

        {/* 会员定价 */}
        <Card title="会员定价" style={{ marginBottom: 16 }}>
          <Form.List name="membershipPrices">
            {(fields) => (
              <Row gutter={[16, 8]}>
                {fields.map((field) => {
                  const item = config?.membershipPrices[field.name]
                  return (
                    <Col key={field.key} xs={24} sm={12}>
                      <Form.Item label={item?.levelName ?? `等级 ${field.name + 1}`} style={{ marginBottom: 0 }}>
                        <Space>
                          <Form.Item name={[field.name, 'levelId']} noStyle><InputNumber style={{ display: 'none' }} /></Form.Item>
                          <Form.Item name={[field.name, 'price']} noStyle rules={[{ required: true }]}>
                            <InputNumber min={0} step={100} addonBefore="¥" addonAfter="分" style={{ width: 200 }} />
                          </Form.Item>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({item?.price ? `¥${(item.price / 100).toFixed(2)}` : '--'})
                          </Text>
                        </Space>
                      </Form.Item>
                    </Col>
                  )
                })}
              </Row>
            )}
          </Form.List>
        </Card>

        {/* 功能开关 */}
        <Card title="功能开关">
          <Form.List name="featureToggles">
            {(fields) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field) => {
                  const item = config?.featureToggles[field.name]
                  return (
                    <Row key={field.key} justify="space-between" align="middle" style={{ padding: '4px 0' }}>
                      <Col>
                        <Form.Item name={[field.name, 'key']} noStyle><input type="hidden" /></Form.Item>
                        <Text>{item?.label ?? `功能 ${field.name + 1}`}</Text>
                      </Col>
                      <Col>
                        <Form.Item name={[field.name, 'enabled']} noStyle valuePropName="checked">
                          <Switch checkedChildren="开" unCheckedChildren="关" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                })}
              </Space>
            )}
          </Form.List>
        </Card>

        <Divider />
        <Button type="primary" htmlType="submit" loading={saving} size="large">保存配置</Button>
      </Form>
    </div>
  )
}
