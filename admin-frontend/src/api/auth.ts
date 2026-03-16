import request from '@/utils/request'
import { UserInfo } from '@/store/auth'

export interface LoginParams {
  code: string
  role: string
}

export interface LoginResult {
  code: number
  data: UserInfo
}

export function login(params: LoginParams) {
  return request.post<LoginResult, LoginResult>('/auth/login', params)
}

export function adminLogin(params: { code: string; password: string; role: string }) {
  return request.post<LoginResult, LoginResult>('/auth/admin-login', params)
}
