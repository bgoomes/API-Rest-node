// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: Date
    }
  }
}
