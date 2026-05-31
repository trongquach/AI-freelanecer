export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  /** Spring's Page uses 'number', our custom PageResponse uses 'page' */
  number: number
  page: number
  first: boolean
  last: boolean
}
