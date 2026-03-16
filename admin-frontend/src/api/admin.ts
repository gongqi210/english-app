import request from '@/utils/request'

export interface InstitutionApplication {
  id: number
  name: string
  contact: string
  phone: string
  address: string
  remark: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string
  createTime: string
  reviewTime: string
}

export interface AdminUser {
  id: number
  nickname: string
  phone: string
  role: string
  status: number
  institutionId: number
  institutionName: string
  createTime: string
}

export interface ContentReport {
  id: number
  reporterNickname: string
  contentType: 'question' | 'book'
  contentId: number
  reason: string
  status: 'pending' | 'handled' | 'dismissed'
  handleNote: string
  createTime: string
}

export interface OrderDTO {
  id: number
  orderNo: string
  userNickname: string
  levelName: string
  amount: number
  status: string
  payTime: string
  createTime: string
}

export interface SystemConfig {
  membershipPrices: { levelId: number; levelName: string; price: number }[]
  featureToggles: { key: string; label: string; enabled: boolean }[]
}

export interface OperationLog {
  id: number
  operatorNickname: string
  operatorRole: string
  action: string
  targetType: string
  targetId: number
  detail: string
  ip: string
  createTime: string
}

export interface PageResult<T> {
  records: T[]
  total: number
}

// 机构入驻申请
export function getApplications(params?: { status?: string; pageNum?: number; pageSize?: number }) {
  return request.get<never, { code: number; data: PageResult<InstitutionApplication> }>('/admin/applications', { params })
}

export function approveApplication(id: number, note?: string) {
  return request.post<never, { code: number }>(`/admin/applications/${id}/approve`, { note })
}

export function rejectApplication(id: number, note: string) {
  return request.post<never, { code: number }>(`/admin/applications/${id}/reject`, { note })
}

// 用户管理
export function getAdminUsers(params?: { keyword?: string; role?: string; status?: number; pageNum?: number; pageSize?: number }) {
  return request.get<never, { code: number; data: PageResult<AdminUser> }>('/admin/users', { params })
}

export function banUser(id: number) {
  return request.post<never, { code: number }>(`/admin/users/${id}/ban`)
}

export function unbanUser(id: number) {
  return request.post<never, { code: number }>(`/admin/users/${id}/unban`)
}

export function resetPassword(id: number) {
  return request.post<never, { code: number; data: { newPassword: string } }>(`/admin/users/${id}/reset-password`)
}

// 内容举报
export function getReports(params?: { status?: string; pageNum?: number; pageSize?: number }) {
  return request.get<never, { code: number; data: PageResult<ContentReport> }>('/admin/reports', { params })
}

export function handleReport(id: number, action: 'takedown' | 'dismiss', note: string) {
  return request.post<never, { code: number }>(`/admin/reports/${id}/handle`, { action, note })
}

// 财务订单
export function getOrders(params?: { status?: string; pageNum?: number; pageSize?: number }) {
  return request.get<never, { code: number; data: PageResult<OrderDTO> }>('/admin/orders', { params })
}

// 系统配置
export function getSystemConfig() {
  return request.get<never, { code: number; data: SystemConfig }>('/admin/config')
}

export function updateSystemConfig(data: SystemConfig) {
  return request.put<never, { code: number }>('/admin/config', data)
}

// 操作日志
export function getLogs(params?: { pageNum?: number; pageSize?: number; action?: string }) {
  return request.get<never, { code: number; data: PageResult<OperationLog> }>('/admin/logs', { params })
}
