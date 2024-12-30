import { i18n } from '@arextest/arex-core';

export { default as globalStoreInit } from './globalStoreInit';
export { default as request } from './request';

/**
 * 取反函数
 * @param value
 * @param negate 是否取反
 */
export function negate(value: any, negate = true): boolean {
  return negate ? !value : !!value;
}

//版本号比较
export const versionStringCompare = (preVersion = '', lastVersion = '') => {
  const sources = preVersion.split('.');
  const dests = lastVersion.split('.');
  const maxL = Math.max(sources.length, dests.length);
  let result = 0;
  for (let i = 0; i < maxL; i++) {
    const preValue: any = sources.length > i ? sources[i] : 0;
    const preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue);
    const lastValue: any = dests.length > i ? dests[i] : 0;
    const lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue);
    if (preNum < lastNum) {
      result = -1;
      break;
    } else if (preNum > lastNum) {
      result = 1;
      break;
    }
  }
  return result;
};

export function isChrome() {
  return /Chrome/.test(navigator.userAgent);
}

// 检查 Chrome 版本号
export function getChromeVersion() {
  if (!isChrome()) {
    return window.message.info(i18n.t('notChrome'));
  }
  let v: any = '';
  try {
    v = navigator.userAgent
      .toLowerCase()
      .match(/chrome\/[\d.]+/gi)?.[0]
      .split('/')[1];
  } catch (e) {
    console.error(e);
  }
  if (versionStringCompare(v, '89.00.00') < 0) {
    return window.message.info(i18n.t('chromeVersionTooLow'));
  }
}

export type WithId = {
  __INNER_ID__: string;
};

export function wrapWithIds<T>(data: T[]) {
  if (!data) return data;
  return data.map((i) => wrapWithId(i));
}

export function wrapWithId<T>(data: T): T & WithId {
  if (!data) return data as T & WithId;
  return {
    ...data,
    __INNER_ID__: genDefaultId(),
  };
}

export function genDefaultId() {
  return generateId(10);
}
export function generateId(len: number) {
  let id = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = chars.length;
  for (let i = 0; i < len; i++) {
    id += chars.charAt(Math.floor(Math.random() * length));
  }
  return id;
}

export function isObjectOrArray(value: unknown): value is object | Array<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.constructor === Object || value.constructor === Array)
  );
}

export function download(content: string, filename: string) {
  // 创建a标签
  const eleLink = document.createElement('a');
  // 设置a标签 download 属性，以及文件名
  eleLink.download = filename;
  // a标签不显示
  eleLink.style.display = 'none';
  // 获取字符内容，转为blob地址
  const blob = new Blob([content]);
  // blob地址转为URL
  eleLink.href = URL.createObjectURL(blob);
  // a标签添加到body
  document.body.appendChild(eleLink);
  // 触发a标签点击事件，触发下载
  eleLink.click();
  // a标签从body移除
  document.body.removeChild(eleLink);
}

/**
 * 根据路径获取对象的值
 * @param obj
 * @param path
 */
export function getValueByPath(obj: object | undefined, path: string | string[]): any {
  if (typeof path === 'string') {
    path = path.split('.');
  }
  return path.reduce<Record<string, any>>((o, k) => (o || {})[k], obj || {});
}

/**
 * 根据路径设置对象的值
 * @param obj
 * @param path
 * @param value
 */
export function setValueByPath(obj: object, path: string | string[], value: any) {
  // path 如果是 string 则直接赋值；如果是数组则遍历赋值，如果不存在则创建
  if (typeof path === 'string') {
    path = path.split('.');
  }
  path.reduce<Record<string, any>>((o, k, i) => {
    if (i === path.length - 1) {
      o[k] = value;
    } else {
      if (typeof o[k] === 'undefined') {
        o[k] = {};
      }
    }
    return o[k];
  }, obj);

  return obj;
}
