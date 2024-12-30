import { QueryNodeReq } from '@/services/ComparisonService/queryIgnoreNode';
import { request } from '@/utils';

export type IgnoreCategory = {
  operationType: string;
  operationName?: string;
};

export interface InsertIgnoreCategoryReq extends QueryNodeReq<'Interface'> {
  ignoreCategoryDetail: IgnoreCategory;
}

export async function insertIgnoreCategory(params: InsertIgnoreCategoryReq) {
  const res = await request.post<boolean>(
    '/webApi/config/comparison/ignoreCategory/modify/INSERT',
    params,
  );
  return res.body;
}
