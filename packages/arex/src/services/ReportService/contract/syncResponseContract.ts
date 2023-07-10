import { request } from '@/utils';

import { Contract } from './queryContract';

export interface SyncResponseContractReq {
  appId: string;
  operationId: string;
}

export type DependencyInfo = {
  dependencyId: string;
  dependencyName: string;
  dependencyType: string;
};

export type DependencyData = DependencyInfo & { contract: Contract };

export interface SyncResponseContractRes {
  entryPointContractStr: Contract;
  dependencyList: DependencyData[];
}

export async function syncResponseContract(params: SyncResponseContractReq) {
  const res = await request.post<SyncResponseContractRes>(
    '/report/report/syncResponseContract',
    params,
  );

  return res.body;
}
