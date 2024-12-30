import { describe, expect, test } from 'vitest';

import { getArrayValidElement } from './getArrayValidElement';

describe('getArrayValidElement', () => {
  test('simple array', () => {
    const array = [1, 2, 3];
    expect(getArrayValidElement(array)).toEqual(1);
  });

  test('complex array', () => {
    const array = [
      { name: 'Helen', age: 20 },
      { name: 'Jesse', age: 22 },
    ];
    expect(getArrayValidElement(array)).toEqual({ name: 'Helen', age: 20 });
  });

  test('nested array', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(getArrayValidElement(array)).toEqual(1);
  });

  test('nested complex array', () => {
    const array = [[{ name: 'Helen', age: 20 }], [{ name: 'Jesse', age: 22 }]];
    expect(getArrayValidElement(array)).toEqual({ name: 'Helen', age: 20 });
  });

  test('empty array', () => {
    const array: any[] = [];
    expect(getArrayValidElement(array)).toEqual(undefined);
  });
});
