import { RootTransformInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { PagingResponse } from '@/services/type';
import { request } from '@/utils';

import { PageQueryComparisonReq } from './queryAggregateIgnoreNode';

export type QueryRootTransformSearchParams = {
  // operationIds?: (string | null)[]; // use null search for global
  // dependencyIds?: (string | null)[];
  keyOfOperationName?: string;
  keyOfDependencyName?: string;
  keyOfMethodName?: string;
};

export type PageQueryIgnoreComparisonReq = PageQueryComparisonReq<QueryRootTransformSearchParams>;

export type PageQueryRootTransformComparisonRes = PagingResponse<{
  rootTransformInfos: RootTransformInfo[];
}>;

export async function queryAggregateRootTransform(params: PageQueryIgnoreComparisonReq) {
  const { pageIndex = 1, pageSize = 10, needTotal = true, ...restParams } = params;
  const res = await request.post<PageQueryRootTransformComparisonRes>(
    '/webApi/config/comparison/rootTransform/pageQueryComparisonConfig',
    {
      pageIndex,
      pageSize,
      needTotal,
      ...restParams,
    },
  );
  return res.body;
}
