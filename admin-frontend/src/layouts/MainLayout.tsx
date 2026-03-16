import { useState } from 'react'
import { ProLayout } from '@ant-design/pro-components'
import { Avatar, Dropdown, Space, Typography } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { getMenusByRole, getRoleTitle } from '@/config/menus'

const { Text } = Typography

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, clearAuth } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  if (!userInfo) return null

  const menus = getMenusByRole(userInfo.role)
  const title = getRoleTitle(userInfo.role)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const userDropdownItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <ProLayout
      title="英语学习平台"
      logo={false}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      layout="side"
      menuDataRender={() => menus}
      location={{ pathname: location.pathname }}
      onMenuHeaderClick={() => navigate('/')}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      avatarProps={{
        src: userInfo.avatar,
        icon: !userInfo.avatar ? <UserOutlined /> : undefined,
        title: (
          <Space>
            <Text>{userInfo.nickname || '用户'}</Text>
          </Space>
        ),
        render: (props, dom) => (
          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
            {dom}
          </Dropdown>
        ),
      }}
      actionsRender={() => []}
      pageTitleRender={false}
      breadcrumbRender={false}
    >
      <Outlet />
    </ProLayout>
  )
}
