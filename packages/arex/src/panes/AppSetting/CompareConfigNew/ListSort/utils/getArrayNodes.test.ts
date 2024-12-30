import { describe, expect, test } from 'vitest';

import { getArrayNodes } from './getArrayNodes';

describe('getArrayNode', () => {
  test('no array object', () => {
    const object = { name: 'Helen', age: 20 };
    expect(getArrayNodes(object)).toMatchSnapshot();
  });

  test('object with simple array and sortNodeList', () => {
    const object = {
      responsestatustype: {
        responsecode: 1,
        responsedesc: 'String',
        timestamp: 1,
      },
      body: [
        {
          name: 'String',
          id: 1,
          age: 1,
        },
      ],
    };
    expect(
      getArrayNodes(
        object,
        '',
        [
          {
            id: '',
            appId: '',
            operationId: '',
            modifiedTime: 0,
            expirationType: 0,
            expirationDate: 0,
            listPath: ['body'],
            keys: [['name'], ['id'], ['age']],
            path: 'body/',
            pathKeyList: ['name/', 'id/', 'age/'],
            status: null,
          },
        ],
        'green',
      ),
    ).toMatchSnapshot();
  });

  test('object with nest array and sortNodeList', () => {
    const object = {
      responsestatustype: {
        responsecode: 1,
        responsedesc: 'String',
        timestamp: 1,
      },
      body: [
        {
          name: 'String',
          id: 1,
          age: 1,
        },
      ],
      nestArray: [
        [
          {
            name: 'String',
            id: 1,
            age: 1,
          },
        ],
      ],
    };

    expect(
      getArrayNodes(
        object,
        '',
        [
          {
            id: '',
            appId: '',
            operationId: '',
            modifiedTime: 0,
            expirationType: 0,
            expirationDate: 0,
            listPath: ['body'],
            keys: [['name'], ['id'], ['age']],
            path: 'body/',
            pathKeyList: ['name/', 'id/', 'age/'],
            status: null,
          },
          {
            id: '',
            appId: '',
            operationId: '',
            modifiedTime: 0,
            expirationType: 0,
            expirationDate: 0,
            listPath: ['nestArray'],
            keys: [['id'], ['age']],
            path: 'nestArray/',
            pathKeyList: ['id/', 'age/'],
            status: null,
          },
        ],
        'green',
      ),
    ).toMatchSnapshot();
  });
});
