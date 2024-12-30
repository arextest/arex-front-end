import { IgnoreCategoryInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingResponse } from '@/services/type';
import { request } from '@/utils';

import { PageQueryComparisonReq } from './queryAggregateIgnoreNode';

export type QueryIgnoreCategorySearchParams = {
  // operationIds?: (string | null)[]; // use null search for global
  // dependencyIds?: (string | null)[];
  keyOfOperationName?: string;
  keyOfIgnoreOperationType?: string;
  keyOfIgnoreOperationName?: string;
};

export type PageQueryIgnoreCategoryComparisonReq =
  PageQueryComparisonReq<QueryIgnoreCategorySearchParams>;

export type PageQueryIgnoreCategoryComparisonRes = PagingResponse<{
  ignoreCategories: IgnoreCategoryInfo[];
}>;

export async function queryAggregateIgnoreCategory(params: PageQueryIgnoreCategoryComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryIgnoreCategoryComparisonRes>(
    '/webApi/config/comparison/ignoreCategory/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
