import Icon, {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { copyToClipboard, css, TooltipButton } from '@arextest/arex-core';
import { Button, Empty, Input, message, theme, Tooltip } from 'antd';
import { cloneDeep } from 'lodash';
import PM from 'postman-collection';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactSortable } from 'react-sortablejs';

import IconGripVertical from '~icons/lucide/grip-vertical';

import { useArexRequestStore } from '../../hooks';
import { FormHeaderWrapper } from './FormHeader';
import { converToUrl, removePMparams } from './helpers';

const { useToken } = theme;

const HttpParameters: FC = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const { store, dispatch } = useArexRequestStore();
  const { endpoint } = store.request;
  const setEndpoint = (newEndpoint: string) => {
    dispatch((state) => {
      state.request.endpoint = newEndpoint;
    });
  };

  const { params } = store.request;
  const setParams = (handledParams: any) => {
    dispatch((state) => {
      state.request.params = handledParams;
    });
  };
  const handledParams = useMemo(() => {
    return params.map((p, index) => ({
      ...p,
      id: index,
    }));
  }, [params]);
  useEffect(() => {
    const query = PM.Url.parse(endpoint).query || [];
    if (
      JSON.stringify(query) !== JSON.stringify(params.map(({ key, value }) => ({ key, value })))
    ) {
      if (typeof query !== 'string') {
        // @ts-ignore
        const x = query.map(({ key, value }, index) => ({
          key,
          value: value || '',
          active: true,
          id: index,
        }));
        setParams(x);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    const endpointParse = PM.Url.parse(endpoint);
    const endpointParseCopy = removePMparams(endpointParse);
    if (params.length > 0) {
      setEndpoint(endpointParseCopy.toString() + converToUrl(params));
    }
  }, [params]);

  return (
    <div>
      <FormHeaderWrapper>
        <span>{t('request.parameter_list')}</span>
        <div>
          <Tooltip title={'Copy'}>
            <Button
              type='text'
              icon={<CopyOutlined />}
              onClick={() => {
                copyToClipboard(
                  JSON.stringify(handledParams.map((i) => ({ key: i.key, value: i.value }))),
                );
                message.success('copy success🎉');
              }}
            />
          </Tooltip>
          <Tooltip title={t('action.clear_all')}>
            <Button
              type='text'
              icon={<DeleteOutlined />}
              onClick={() => {
                setParams([]);
              }}
            />
          </Tooltip>
          <Tooltip title={t('add.new')}>
            <Button
              type='text'
              icon={<PlusOutlined />}
              onClick={() => {
                setParams(
                  handledParams.concat([{ value: '', key: '', id: params.length, active: true }]),
                );
              }}
            />
          </Tooltip>
        </div>
      </FormHeaderWrapper>
      {handledParams.length > 0 ? (
        <ReactSortable
          animation={250}
          handle={'.handle'}
          list={handledParams}
          setList={setParams}
          css={css`
            border: 0.5px solid ${token.colorBorder};
            display: flex;
            flex-direction: column;
          `}
        >
          {handledParams.map((item) => (
            <div
              key={item.id}
              css={css`
                display: flex;
              `}
            >
              <div
                className={'handle'}
                css={css`
                  padding: 5px 12px;
                  border: 0.5px solid ${token.colorBorder};
                  cursor: grab;
                `}
              >
                <Icon component={IconGripVertical} />
              </div>
              <div
                css={css`
                  border: 0.5px solid ${token.colorBorder};
                  flex: 1;
                  display: flex;
                  align-items: center;
                  padding: 0 10px;
                `}
              >
                <Input
                  size={'small'}
                  bordered={false}
                  css={css``}
                  type={'text'}
                  value={item.key}
                  onChange={(val) => {
                    const s = JSON.parse(JSON.stringify(handledParams));
                    const newValue = s.find((i: any) => i.id === item.id);
                    newValue.key = val.target.value;
                    setParams(s);
                  }}
                />
              </div>

              <div
                css={css`
                  border: 0.5px solid ${token.colorBorder};
                  flex: 1;
                  display: flex;
                  align-items: center;
                  padding: 0 10px;
                `}
              >
                <Input
                  size={'small'}
                  bordered={false}
                  css={css``}
                  type={'text'}
                  value={item.value}
                  onChange={(val) => {
                    const s = JSON.parse(JSON.stringify(handledParams));
                    const newValue = s.find((i: any) => i.id === item.id);
                    newValue.value = val.target.value;
                    setParams(s);
                  }}
                />
              </div>

              <div
                css={css`
                  border: 0.5px solid ${token.colorBorder};
                  //flex: 1;
                  display: flex;
                  align-items: center;
                  padding: 0 5px;
                `}
              >
                <>
                  <TooltipButton
                    title={item.active ? t('action.turn_off') : t('action.turn_on')}
                    style={{ color: token.colorSuccess }}
                    icon={item.active ? <CheckCircleOutlined /> : <StopOutlined />}
                    onClick={() => {
                      const params = cloneDeep(handledParams);
                      const newValue = params.find((i) => i.id === item.id);
                      newValue!.active = !newValue?.active;
                      setParams(params);
                    }}
                  />
                  <TooltipButton
                    title={t('action.remove')}
                    style={{ color: token.colorError }}
                    type='text'
                    size='small'
                    icon={<DeleteOutlined />}
                    onClick={
                      () => {
                        const params = cloneDeep(handledParams);
                        const index = params.findIndex((i) => i.id === item.id);
                        params.splice(index, 1);
                        setParams(params);
                        const endpointParse = PM.Url.parse(endpoint);
                        const endpointParseCopy = removePMparams(endpointParse);
                        setEndpoint(endpointParseCopy.toString());
                      }
                      // paramsUpdater?.((params) => {
                      //   params.splice(i, 1);
                      // })
                    }
                  />
                </>
              </div>
            </div>
          ))}
        </ReactSortable>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default HttpParameters;
