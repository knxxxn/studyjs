import { ReactNode } from 'react'

interface ReactChildren {
  children: ReactNode
}

interface ResponseType {
  status: number
  data?: any
  message?: string
}

export type { ReactChildren, ResponseType }
