import { tryParseJsonString } from '@arextest/arex-core';
import { describe, expect, test } from 'vitest';

import { getIgnoreNodes } from './getIgnoreNodes';

describe('convert sort tree', () => {
  test('simple object', () => {
    const objectData = { name: 'Helen', age: 20 };
    expect(getIgnoreNodes(objectData)).toMatchSnapshot();
  });

  test('complex object', () => {
    const objectData = {
      name: 'Helen',
      age: 20,
      hobby: ['music', 'football'],
      assets: {
        house: 'shanghai',
        car: ['BMW', 'Benz'],
        savings: 1000000,
      },
    };
    expect(getIgnoreNodes(objectData)).toMatchSnapshot();
  });

  test('lossless json string', () => {
    const jsonString = '{"name":"Helen","age":20.00000000}';
    expect(getIgnoreNodes(tryParseJsonString(jsonString) as object)).toMatchSnapshot();
  });
});
