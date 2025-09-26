export interface PaginatedResult<T> {
  totalCount: number;
  items: T[];
}
