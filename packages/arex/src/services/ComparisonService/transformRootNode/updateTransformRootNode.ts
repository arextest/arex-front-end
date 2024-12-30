import { QueryNodeReq } from '@/services/ComparisonService';
import { request } from '@/utils';

import { TransformRootNodeParams } from './queryTransformRootNode';

export interface UpdateTransformRootNodeReq
  extends QueryNodeReq<'Global'>,
    TransformRootNodeParams {}

export async function updateTransformRootNode(params: UpdateTransformRootNodeReq) {
  const res = await request.post<boolean>(
    '/webApi/config/comparison/rootTransform/modify/INSERT',
    params,
  );

  return res.body;
}
