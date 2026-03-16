import {
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  BankOutlined,
  UserOutlined,
  SettingOutlined,
  AuditOutlined,
  DollarOutlined,
  FlagOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import type { MenuDataItem } from '@ant-design/pro-components'
import { UserRole } from '@/store/auth'

const teacherMenus: MenuDataItem[] = [
  {
    path: '/teacher',
    name: '老师工作台',
    icon: <HomeOutlined />,
    children: [
      {
        path: '/teacher/questions',
        name: '题目管理',
        icon: <FileTextOutlined />,
      },
      {
        path: '/teacher/homework',
        name: '作业管理',
        icon: <BookOutlined />,
      },
      {
        path: '/teacher/books',
        name: '练习册管理',
        icon: <BookOutlined />,
      },
    ],
  },
]

const principalMenus: MenuDataItem[] = [
  {
    path: '/principal',
    name: '校长工作台',
    icon: <HomeOutlined />,
    children: [
      {
        path: '/principal/dashboard',
        name: '数据大盘',
        icon: <BarChartOutlined />,
      },
      {
        path: '/principal/students',
        name: '学生管理',
        icon: <TeamOutlined />,
      },
      {
        path: '/principal/teachers',
        name: '老师管理',
        icon: <UserOutlined />,
      },
      {
        path: '/principal/campuses',
        name: '校区管理',
        icon: <BankOutlined />,
      },
    ],
  },
]

const adminMenus: MenuDataItem[] = [
  {
    path: '/admin',
    name: '运营管理',
    icon: <HomeOutlined />,
    children: [
      {
        path: '/admin/institutions',
        name: '机构管理',
        icon: <BankOutlined />,
      },
      {
        path: '/admin/reports',
        name: '内容举报',
        icon: <FlagOutlined />,
      },
      {
        path: '/admin/users',
        name: '用户管理',
        icon: <UserOutlined />,
      },
      {
        path: '/admin/orders',
        name: '财务订单',
        icon: <DollarOutlined />,
      },
      {
        path: '/admin/config',
        name: '系统配置',
        icon: <SettingOutlined />,
      },
      {
        path: '/admin/logs',
        name: '操作日志',
        icon: <AuditOutlined />,
      },
    ],
  },
]

export function getMenusByRole(role: UserRole): MenuDataItem[] {
  switch (role) {
    case 'teacher':
      return teacherMenus
    case 'principal':
    case 'head_principal':
      return principalMenus
    case 'admin':
      return adminMenus
    default:
      return []
  }
}

export function getRoleTitle(role: UserRole): string {
  const titles: Record<UserRole, string> = {
    teacher: '老师工作台',
    principal: '校长工作台',
    head_principal: '总校长工作台',
    admin: '运营管理后台',
  }
  return titles[role] || '管理后台'
}
