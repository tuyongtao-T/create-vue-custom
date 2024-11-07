import type { CommonTableQueryParams } from './common'

interface Person {
    id: number
    name: string
    age: number
    address: string
    city: string
    province: string
    email: string
    phone: number
    date: string
}

export  interface Demo1Params extends CommonTableQueryParams {
    name: string
    age: number
}

export  interface Demo1ResponseList {
    list: Person[]
    total: number
    current: number
    size: number
}

