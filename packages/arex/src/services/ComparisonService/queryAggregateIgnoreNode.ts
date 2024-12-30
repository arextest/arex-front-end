import { ExclusionInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingRequest, PagingResponse } from '@/services/type';
import { request } from '@/utils';

export type PageQueryComparisonReq<T = Record<string, never>> = PagingRequest<{
  appId: string;
}> &
  T;

export type QueryIgnoreSearchParams = {
  // operationIds?: (string | null)[]; // use null search for global
  // dependencyIds?: (string | null)[];
  keyOfOperationName?: string;
  keyOfDependencyName?: string;
  keyOfExclusionPath?: string;
};

export type PageQueryIgnoreComparisonReq = PageQueryComparisonReq<QueryIgnoreSearchParams>;

export type PageQueryIgnoreComparisonRes = PagingResponse<{ exclusions: ExclusionInfo[] }>;

export async function queryAggregateIgnoreNode(params: PageQueryIgnoreComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryIgnoreComparisonRes>(
    '/webApi/config/comparison/exclusions/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
