import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Table, Spin, Typography } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  BookOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getDashboard, getIncomeTrend, DashboardDTO, IncomeDTO } from '@/api/principal'

const { Title } = Typography

const KPI_CARD_STYLE = { borderRadius: 8 }

export default function PrincipalDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null)
  const [trend, setTrend] = useState<IncomeDTO[]>([])

  useEffect(() => {
    Promise.all([getDashboard(), getIncomeTrend(30)])
      .then(([d, t]) => {
        setDashboard(d.data)
        setTrend(t.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  const d = dashboard

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24 }}>数据大盘</Title>

      {/* KPI 卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="总学生数"
              value={d?.totalStudents ?? 0}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              suffix={<span style={{ fontSize: 12, color: '#52c41a' }}>今日 +{d?.todayStudents ?? 0}</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="老师数"
              value={d?.totalTeachers ?? 0}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="校区数"
              value={d?.totalCampuses ?? 0}
              prefix={<BankOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="作业待批改"
              value={d?.pendingReview ?? 0}
              prefix={<BookOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="今日收入 (元)"
              value={((d?.todayIncome ?? 0) / 100).toFixed(2)}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="本月收入 (元)"
              value={((d?.monthIncome ?? 0) / 100).toFixed(2)}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="今日作业布置"
              value={d?.todayHomework ?? 0}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={KPI_CARD_STYLE}>
            <Statistic
              title="平均得分"
              value={d?.avgScore ?? 0}
              suffix="分"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* 收入趋势折线图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="近30天收入趋势" style={KPI_CARD_STYLE}>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMembership" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `¥${(v / 100).toFixed(0)}`} />
                  <Tooltip formatter={(v) => typeof v === 'number' ? `¥${(v / 100).toFixed(2)}` : v} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="membershipIncome"
                    name="会员收入"
                    stroke="#1677ff"
                    fill="url(#colorMembership)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookIncome"
                    name="练习册收入"
                    stroke="#52c41a"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 60 }}>暂无数据</div>
            )}
          </Card>
        </Col>

        {/* 老师排行榜 */}
        <Col xs={24} lg={8}>
          <Card title="老师作业排行" style={{ ...KPI_CARD_STYLE, height: '100%' }}>
            <Table
              dataSource={d?.topTeachers ?? []}
              rowKey="teacherId"
              size="small"
              pagination={false}
              columns={[
                { title: '老师', dataIndex: 'teacherName', ellipsis: true },
                { title: '作业数', dataIndex: 'homeworkCount', width: 70, align: 'right' },
                { title: '学生', dataIndex: 'studentCount', width: 60, align: 'right' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
