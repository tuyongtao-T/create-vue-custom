import { MockMethod } from 'vite-plugin-mock'
import Mock, { Random } from 'mockjs'

export default [
  {
    url: '/api/getPersonList',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: 'ok',
        data: Mock.mock({
          'list|4': [
            {
              id: '@id',
              name: '@cname',
              age: Random.integer(1, 100),
              address: '@county',
              city: '@city',
              province: '@province',
              email: Random.email(),
              phone: /^1[0-9]{10}$/,
              regin: '@region',
              url: '@url',
              date: Random.date('yyyy-MM-dd')
            }
          ]
        })
      }
    }
  }
] as MockMethod[]
