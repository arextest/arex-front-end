import { DataNode } from 'antd/lib/tree';

import { getArrayValidElement } from '@/panes/AppSetting/CompareConfig/NodesSort/utils';

/**
 * 获取 object 的节点信息
 * @param object
 * @param basePath
 */
export function getIgnoreNodes(object?: object, basePath = ''): DataNode[] {
  if (!object) return [];

  const entries = Object.entries(object);
  return entries.map(([key, value]) => {
    const losslessValue = value.isLosslessNumber ? value.value : value;
    const isSimpleArray =
      Array.isArray(losslessValue) && ['number', 'string'].includes(typeof losslessValue[0]);
    const isObject = typeof losslessValue === 'object';

    const path = basePath + key + '/';

    return losslessValue && isObject && !isSimpleArray
      ? {
          title: key,
          key: path,
          children: getIgnoreNodes(
            Array.isArray(losslessValue)
              ? getArrayValidElement(losslessValue) || {}
              : losslessValue,
            path,
          ),
        }
      : { title: key, key: path, value: losslessValue };
  });
}
