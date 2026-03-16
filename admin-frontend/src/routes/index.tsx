import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/store/auth'
import LoginPage from '@/pages/Login'
import MainLayout from '@/layouts/MainLayout'

// 老师端页面
import TeacherQuestions from '@/pages/teacher/Questions'
import TeacherHomework from '@/pages/teacher/Homework'
import TeacherBooks from '@/pages/teacher/Books'

// 校长端页面
import PrincipalDashboard from '@/pages/principal/Dashboard'
import PrincipalStudents from '@/pages/principal/Students'
import PrincipalTeachers from '@/pages/principal/Teachers'
import PrincipalCampuses from '@/pages/principal/Campuses'

// 运营端页面
import AdminInstitutions from '@/pages/admin/Institutions'
import AdminReports from '@/pages/admin/Reports'
import AdminUsers from '@/pages/admin/Users'
import AdminOrders from '@/pages/admin/Orders'
import AdminConfig from '@/pages/admin/Config'
import AdminLogs from '@/pages/admin/Logs'

// 已登录用户的默认跳转
function DefaultRedirect() {
  const userInfo = useAuthStore((s) => s.userInfo)
  const roleHome: Record<UserRole, string> = {
    teacher: '/teacher/questions',
    principal: '/principal/dashboard',
    head_principal: '/principal/dashboard',
    admin: '/admin/institutions',
  }
  if (!userInfo) return <Navigate to="/login" replace />
  return <Navigate to={roleHome[userInfo.role]} replace />
}

// 需要登录的路由守卫
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn())
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DefaultRedirect />} />

        {/* 老师端 */}
        <Route path="teacher/questions" element={<TeacherQuestions />} />
        <Route path="teacher/homework" element={<TeacherHomework />} />
        <Route path="teacher/books" element={<TeacherBooks />} />

        {/* 校长端 */}
        <Route path="principal/dashboard" element={<PrincipalDashboard />} />
        <Route path="principal/students" element={<PrincipalStudents />} />
        <Route path="principal/teachers" element={<PrincipalTeachers />} />
        <Route path="principal/campuses" element={<PrincipalCampuses />} />

        {/* 运营端 */}
        <Route path="admin/institutions" element={<AdminInstitutions />} />
        <Route path="admin/reports" element={<AdminReports />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/orders" element={<AdminOrders />} />
        <Route path="admin/config" element={<AdminConfig />} />
        <Route path="admin/logs" element={<AdminLogs />} />

        {/* 404 兜底 */}
        <Route path="*" element={<DefaultRedirect />} />
      </Route>
    </Routes>
  )
}
