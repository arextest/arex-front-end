/**
 * 获取一个数组中的有效元素（非数组类型的对象或者基本数据类型）
 * @param array
 */
export function getArrayValidElement(array: any[]): any {
  const sample = array[0];
  return Array.isArray(sample) ? getArrayValidElement(sample) : sample;
}
