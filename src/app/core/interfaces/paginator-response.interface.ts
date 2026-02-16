
export interface PaginatorResponse<T> {
  pages: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}