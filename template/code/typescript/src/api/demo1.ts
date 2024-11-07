import http from '@/utils/primaryHttp'
import { Demo1Params,Demo1ResponseList } from '@/api/dto/index'

export const useDemoApi = {
  getPersonList: (params: Demo1Params ) => http.get<Demo1ResponseList>('/getPersonList', params),
}
