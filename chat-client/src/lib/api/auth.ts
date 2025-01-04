import { BaseApi } from './base'

interface LoginDto {
  username: string
  password: string
}

interface RegisterDto {
  email: string
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

class AuthApi extends BaseApi {
  constructor() {
    super('/api/auth')
  }

  login(data: LoginDto) {
    return this.post<LoginResponse>('/login', data)
  }

  register(data: RegisterDto) {
    return this.post('/register', data)
  }
}

export const authApi = new AuthApi() 