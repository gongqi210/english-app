import request from '@/utils/request'

export interface QuestionOption {
  key: string   // A/B/C/D
  value: string
}

export interface Question {
  id: number
  type: string
  typeName: string
  content: string
  imageUrl?: string
  options?: QuestionOption[]
  correctKey: string
  answer?: string
  difficulty: number
  knowledgePoint?: string
  tags?: string
  usageCount: number
  status: number
  createTime: string
}

export interface QuestionQueryParams {
  type?: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface CreateQuestionRequest {
  type: string
  content: string
  imageUrl?: string
  options?: QuestionOption[]
  correctKey?: string
  answer?: string
  difficulty?: number
  knowledgePoint?: string
  tags?: string
}

// 题目列表（分页）
export function getQuestions(params: QuestionQueryParams) {
  return request.get<never, { code: number; data: PageResult<Question> }>('/teacher/questions', { params })
}

// 创建题目
export function createQuestion(data: CreateQuestionRequest) {
  return request.post<never, { code: number; data: Question }>('/teacher/questions', data)
}

// 更新题目
export function updateQuestion(id: number, data: Partial<CreateQuestionRequest>) {
  return request.put<never, { code: number }>(`/teacher/questions/${id}`, data)
}

// 删除题目
export function deleteQuestion(id: number) {
  return request.delete<never, { code: number }>(`/teacher/questions/${id}`)
}

// 复制题目
export function copyQuestion(id: number) {
  return request.post<never, { code: number; data: Question }>(`/teacher/questions/${id}/copy`)
}

// 下载批量导入模板
export function downloadTemplate() {
  return request.get('/teacher/questions/template', {
    responseType: 'blob',
  })
}

// 批量导入题目
export interface ImportError {
  row: number
  message: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
}

export function importQuestions(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, { code: number; data: ImportResult }>(
    '/teacher/questions/import',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}

// 上传图片
export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<never, { code: number; data: { url: string } }>(
    '/upload/image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
}
