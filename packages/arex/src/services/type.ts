export type PagingRequest<T> = {
  pageIndex?: number;
  pageSize?: number;
  needTotal?: boolean;
} & T;

export type PagingResponse<T> = {
  totalCount: number;
} & T;
