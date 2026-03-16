import request from '@/utils/request'

export interface DashboardDTO {
  totalStudents: number
  todayStudents: number
  totalTeachers: number
  totalCampuses: number
  todayIncome: number
  monthIncome: number
  totalIncome: number
  todayHomework: number
  pendingReview: number
  avgScore: number
  topTeachers: TeacherRankDTO[]
  recentIncome: IncomeDTO[]
}

export interface TeacherRankDTO {
  teacherId: number
  teacherName: string
  homeworkCount: number
  studentCount: number
}

export interface IncomeDTO {
  date: string
  membershipIncome: number
  bookIncome: number
  otherIncome: number
  totalIncome: number
  newStudents: number
  activeStudents: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface StudentDTO {
  id: number
  nickname: string
  phone: string
  campusId: number
  campusName: string
  status: number
  createTime: string
}

export interface TeacherDTO {
  id: number
  nickname: string
  phone: string
  campusId: number
  campusName: string
  status: number
  createTime: string
}

export interface CampusDTO {
  id: number
  institutionId: number
  name: string
  address: string
  contact: string
  phone: string
  studentCount: number
  teacherCount: number
  status: number
}

// 数据大盘
export function getDashboard() {
  return request.get<never, { code: number; data: DashboardDTO }>('/principal/dashboard')
}

export function getIncomeTrend(days = 30) {
  return request.get<never, { code: number; data: IncomeDTO[] }>('/principal/income/trend', { params: { days } })
}

// 学生管理
export function getStudents(params: { pageNum?: number; pageSize?: number; keyword?: string; campusId?: number }) {
  return request.get<never, { code: number; data: PageResult<StudentDTO> }>('/principal/students', { params })
}

export function importStudents(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<never, { code: number; data: { success: number; failed: number; errors: { row: number; message: string }[] } }>(
    '/principal/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}

export function downloadStudentTemplate() {
  return request.get('/principal/students/template', { responseType: 'blob' })
}

// 老师管理
export function getTeachers(params: { pageNum?: number; pageSize?: number; keyword?: string; campusId?: number }) {
  return request.get<never, { code: number; data: PageResult<TeacherDTO> }>('/principal/teachers', { params })
}

export function importTeachers(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post<never, { code: number; data: { success: number; failed: number; errors: { row: number; message: string }[] } }>(
    '/principal/teachers/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}

export function downloadTeacherTemplate() {
  return request.get('/principal/teachers/template', { responseType: 'blob' })
}

// 校区管理
export function getCampuses() {
  return request.get<never, { code: number; data: CampusDTO[] }>('/principal/campuses')
}

export function updateCampus(id: number, data: Partial<CampusDTO>) {
  return request.put<never, { code: number }>(`/campus/${id}`, data)
}
