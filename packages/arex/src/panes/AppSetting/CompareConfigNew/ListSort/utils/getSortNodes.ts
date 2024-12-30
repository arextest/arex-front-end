import { DataNode } from 'antd/lib/tree';

import { getArrayValidElement } from '@/panes/AppSetting/CompareConfig/NodesSort/utils/getArrayValidElement';

export function getSortNodes(data?: any[] | object, basePath = ''): DataNode[] {
  if (!data || (Array.isArray(data) && !data?.length)) return [];

  const sample = Array.isArray(data) ? getArrayValidElement(data) : data;

  if (['number', 'string'].includes(typeof sample))
    return [{ title: '%value%', key: basePath + '%value%/' }];

  const entries = Object.entries<any>(sample);
  return entries.map(([key, value]) => {
    const losslessValue = value.isLosslessNumber ? value.value : value;

    const path = basePath + key + '/';
    return losslessValue && typeof losslessValue === 'object'
      ? {
          title: key,
          key: path,
          children: getSortNodes(
            Array.isArray(losslessValue)
              ? getArrayValidElement(losslessValue) || []
              : losslessValue,
            path,
          ),
        }
      : { title: key, key: path, value: path };
  });
}
