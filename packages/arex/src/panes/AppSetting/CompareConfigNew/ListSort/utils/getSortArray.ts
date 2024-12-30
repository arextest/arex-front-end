import { NodesSortProps } from '@/panes/AppSetting/CompareConfig/NodesSort';
import { getArrayValidElement } from '@/panes/AppSetting/CompareConfig/NodesSort/utils/getArrayValidElement';

/**
 * 根据 path获取 contract 的非数组元素节点
 * @param key
 * @param contract
 * @param caseSensitivity
 */
export function getSortArray(
  key: string,
  contract: NodesSortProps['contractParsed'],
  caseSensitivity: boolean = true,
) {
  let value: any = undefined;
  console.log(key, contract, caseSensitivity);
  key
    .split('/')
    .filter(Boolean)
    .forEach((k, i) => {
      value =
        i === 0
          ? lowercaseObjectKeys(contract, caseSensitivity)?.[k]
          : Array.isArray(value)
          ? lowercaseObjectKeys(getArrayValidElement(value), caseSensitivity)?.[k]
          : lowercaseObjectKeys(value, caseSensitivity)?.[k];
    });

  console.log({ value });
  return value;
}

function lowercaseObjectKeys(obj?: Record<string, any>, disabled: boolean = false) {
  if (disabled) return obj;
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
}
