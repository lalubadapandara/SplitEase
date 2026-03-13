import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data?.message || error.message || 'Something went wrong')
  }
)

export const authAPI = {
  register: (data)    => axiosInstance.post('/auth/register', data),
  login:    (data)    => axiosInstance.post('/auth/login', data),
  google:   (data)    => axiosInstance.post('/auth/google', data),
}

export const usersAPI = {
  getMe:    ()        => axiosInstance.get('/users/me'),
  updateMe: (data)    => axiosInstance.put('/users/me', data),
  search:   (email)   => axiosInstance.get(`/users/search?email=${encodeURIComponent(email)}`),
}

export const groupsAPI = {
  getAll:      ()            => axiosInstance.get('/groups'),
  getById:     (id)          => axiosInstance.get(`/groups/${id}`),
  create:      (data)        => axiosInstance.post('/groups', data),
  addMember:   (id, email)   => axiosInstance.post(`/groups/${id}/members`, { email }),
  getBalances: (id)          => axiosInstance.get(`/groups/${id}/balances`),
  delete:      (id)          => axiosInstance.delete(`/groups/${id}`),
}

export const expensesAPI = {
  getByGroup:          (groupId) => axiosInstance.get(`/expenses/group/${groupId}`),
  getMy:               ()        => axiosInstance.get('/expenses/my'),
  getDashboardSummary: ()        => axiosInstance.get('/expenses/dashboard/summary'),
  create:              (data)    => axiosInstance.post('/expenses', data),
  update:              (id, data) => axiosInstance.put(`/expenses/${id}`, data),
  delete:              (id)      => axiosInstance.delete(`/expenses/${id}`),
}

export const settlementsAPI = {
  getByGroup: (groupId) => axiosInstance.get(`/settlements/group/${groupId}`),
  create:     (data)    => axiosInstance.post('/settlements', data),
}

export default axiosInstance
