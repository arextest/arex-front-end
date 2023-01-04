import { DownOutlined, SaveOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { App, Button, Divider, Dropdown, MenuProps, Select, Space } from 'antd';
import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { HttpContext, HttpProps } from '../../index';
import SmartEnvInput from '../smart/EnvInput';

const HeaderWrapper = styled.div`
  display: flex;
  & > * {
    flex-grow: 1;
    flex: 1;
  }
  & > .send-request-button {
    flex-grow: 0;
  }
  .ant-select > .ant-select-selector {
    width: 120px;
    .ant-select-selection-item {
      font-weight: 500;
    }
  }
`;

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
interface HttpRequestProps {
  onSend: HttpProps['onSend'];
  onSave: HttpProps['onSave'];
  onSendCompare: HttpProps['onSendCompare'];
  breadcrumb: any;
}

const HttpRequest: FC<HttpRequestProps> = ({ onSend, onSave, breadcrumb, onSendCompare }) => {
  const { store, dispatch } = useContext(HttpContext);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === '1') {
      handleRequest({ type: 'compare' });
    }
  };

  const items: MenuProps['items'] = [
    {
      label: 'Send Compare',
      key: '1',
    },
  ];

  function checkRequestParams(requestParams: any) {
    const { body, endpoint } = requestParams;
    if (endpoint === '') {
      return {
        error: true,
        msg: 'please fill in endpoint.',
      };
    }

    if (body.contentType === 'application/json') {
      try {
        JSON.parse(body.body || '{}');
      } catch (e) {
        return {
          error: true,
          msg: 'json format error',
        };
      }
    }
    return {
      error: false,
      msg: '',
    };
  }

  const handleRequest = ({ type }: any) => {
    if (checkRequestParams(store.request).error) {
      message.error(checkRequestParams(store.request).msg);
      return;
    }
    const urlPretreatment = (url: string) => {
      const editorValueMatch = url.match(/\{\{(.+?)\}\}/g) || [''];
      for (let j = 0; j < editorValueMatch.length; j++) {
        let replaceVar = editorValueMatch[j];
        const env = store.environment?.variables || [];
        for (let i = 0; i < env.length; i++) {
          if (env[i].key === editorValueMatch[j].replace('{{', '').replace('}}', '')) {
            replaceVar = env[i].value;
            url = url.replace(editorValueMatch[j], replaceVar);
          }
        }
      }
      return url;
    };

    if (type === 'compare') {
      dispatch((state) => {
        state.compareLoading = true;
      });
      onSendCompare({
        ...store.request,
        endpoint: urlPretreatment(store.request.endpoint),
        compareEndpoint: urlPretreatment(store.request.compareEndpoint),
      }).then((responseAndTestResult: any) => {
        dispatch((state) => {
          state.compareResult = responseAndTestResult.responses;
          state.compareLoading = false;
        });
      });
    } else {
      dispatch((state) => {
        state.response = {
          type: 'loading',
        };
      });

      onSend({
        ...store.request,
        endpoint: urlPretreatment(store.request.endpoint),
      }).then((responseAndTestResult) => {
        dispatch((state) => {
          if (responseAndTestResult.response.type === 'success') {
            state.response = responseAndTestResult.response;
            state.testResult = responseAndTestResult.testResult;
          }
        });
      });
    }
  };

  return (
    <div
      css={css`
        position: relative;
        padding: 0 16px;
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        `}
      >
        {breadcrumb}

        <Space>
          <Select
            css={css`
              width: 100px;
            `}
            value={store.mode}
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Compare', value: 'compare' },
            ]}
            onChange={(value) => {
              dispatch((state) => {
                state.mode = value;
              });
            }}
            size={'small'}
          />

          <Divider type={'vertical'} />

          <Button
            size='small'
            icon={<SaveOutlined />}
            onClick={() => {
              onSave(store.request);
            }}
          >
            {t('action.save')}
          </Button>
        </Space>
      </div>

      <HeaderWrapper>
        <Space.Compact block>
          <Select
            value={store.request.method}
            options={methods.map((i) => ({ value: i, lable: i }))}
            onChange={(value) => {
              dispatch((state) => {
                state.request.method = value;
              });
            }}
          />
          <SmartEnvInput
            value={store.request.endpoint}
            onChange={(value) => {
              dispatch((state) => {
                state.request.endpoint = value;
              });
            }}
          />
        </Space.Compact>

        <Dropdown.Button
          className='send-request-button'
          type='primary'
          icon={<DownOutlined />}
          menu={{
            onClick: handleMenuClick,
            items: items,
          }}
          onClick={() => handleRequest({ type: store.mode === 'normal' ? null : 'compare' })}
          style={{ marginLeft: '16px' }}
        >
          {t('action.send')}
        </Dropdown.Button>
      </HeaderWrapper>

      {store.mode === 'compare' ? (
        <HeaderWrapper
          css={css`
            margin-top: 8px;
          `}
        >
          <Space.Compact block>
            <Select
              value={store.request.compareMethod}
              options={methods.map((i) => ({ value: i, lable: i }))}
              onChange={(value) => {
                dispatch((state) => {
                  state.request.compareMethod = value;
                });
              }}
            />
            <SmartEnvInput
              value={store.request.compareEndpoint}
              onChange={(value) => {
                dispatch((state) => {
                  state.request.compareEndpoint = value;
                });
              }}
            />
          </Space.Compact>

          <Dropdown.Button
            css={css`
              visibility: hidden;
            `}
            className='send-request-button'
            type='primary'
            icon={<DownOutlined />}
            menu={{
              onClick: handleMenuClick,
              items: items,
            }}
            onClick={() => handleRequest({ type: null })}
            style={{ marginLeft: '16px' }}
          >
            {t('action.send')}
          </Dropdown.Button>
        </HeaderWrapper>
      ) : null}
    </div>
  );
};

export default HttpRequest;
