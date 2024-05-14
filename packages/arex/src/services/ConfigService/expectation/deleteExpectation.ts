import { request } from '@/utils';

export async function deleteExpectation(params: { id: string; appId: string }) {
  const res = await request.post<boolean>('/webApi/expectation/delete', params);
  return res.body;
}
