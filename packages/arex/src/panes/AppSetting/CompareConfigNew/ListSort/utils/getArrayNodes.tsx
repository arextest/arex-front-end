import { Badge } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React from 'react';

import { getArrayValidElement } from '@/panes/AppSetting/CompareConfig/NodesSort/utils/getArrayValidElement';
import { SortNode } from '@/services/ComparisonService';

/**
 * 获取 object 的数组类型节点，并为已配置过的数组节点添加圆点提示
 * @param object 契约对象
 * @param basePath 节点路径
 * @param sortNodeList 已配置的节点列表
 * @param color 圆点颜色
 */
export function getArrayNodes(
  object: object,
  basePath = '',
  sortNodeList?: SortNode[],
  color?: string,
): DataNode[] {
  const entries = Object.entries(object);
  return (
    entries
      .map(([key, value]) => {
        const losslessValue = value.isLosslessNumber ? value.value : value;

        const path = basePath + key + '/';
        return losslessValue && typeof losslessValue === 'object'
          ? {
              title: key,
              key: path,
              children: getArrayNodes(
                Array.isArray(losslessValue)
                  ? getArrayValidElement(losslessValue) || {}
                  : losslessValue,
                path,
                sortNodeList,
                color,
              ),
              disabled: !Array.isArray(losslessValue),
              icon: sortNodeList?.find((node) => node.path === path)?.pathKeyList?.length && (
                <Badge color={color} /> // 已配置过的节点使用圆点进行提示
              ),
            }
          : {
              title: key,
              key: path,
              value: losslessValue,
              disabled: !Array.isArray(losslessValue),
            };
      })
      // 过滤非数组子节点
      .filter((item) => item.children || Array.isArray(item.value))
  );
}
