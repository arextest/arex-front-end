import {
  base64Decode,
  DiffJsonView,
  DiffJsonViewProps,
  DiffJsonViewRef,
  DiffMatch,
  EmptyWrapper,
  FlexCenterWrapper,
  getJsonValueByPath,
  JSONEditor,
  jsonIndexPathFilter,
  Label,
  OnRenderContextMenu,
  SpaceBetweenWrapper,
  TagBlock,
  TargetEditor,
  tryStringifyJson,
  useTranslation,
} from '@arextest/arex-core';
import { css } from '@emotion/react';
import { useRequest } from 'ahooks';
import { Allotment } from 'allotment';
import { App, Flex, Input, Menu, Modal, Spin, theme, Typography } from 'antd';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { ScheduleService } from '@/services';
import { DiffLog, InfoItem } from '@/services/ReportService';
import { DIFF_TYPE } from '@/services/ScheduleService';
import { isObjectOrArray } from '@/utils';

import PathTitle from './CaseDiffTitle';

export const SummaryCodeMap: { [key: string]: { color: string; message: string } } = {
  '0': {
    color: 'success',
    message: 'SUCCESS', // 'COMPARED_WITHOUT_DIFFERENCE'
  },
  '1': {
    color: 'magenta',
    message: 'COMPARED_WITH_DIFFERENCE',
  },
  '2': {
    color: 'error',
    message: 'EXCEPTION', // 'COMPARED_INTERNAL_EXCEPTION'
  },
  '3': {
    color: 'orange',
    message: 'SEND_FAILED_NOT_COMPARE',
  },
};

export enum IgnoreType {
  Global,
  Interface,
  Temporary,
}

export type CompareResultDetail = {
  id: string;
  categoryName: string;
  operationName: string;
  diffResultCode: number;
  logInfos: DiffLog[] | null;
  exceptionMsg: string | null;
  baseMsg: string;
  testMsg: string;
};
export interface DiffPathViewerProps extends DiffJsonViewProps {
  loading?: boolean;
  data: InfoItem;
  height?: string;
  defaultActiveFirst?: boolean;
  onChange?: (record?: InfoItem, data?: CompareResultDetail) => void;
  onIgnoreKey?: (path: string[], type: IgnoreType) => void;
  onSortKey?: (path: string[]) => void;
}

const CaseDiffViewer: FC<DiffPathViewerProps> = (props) => {
  const { t } = useTranslation('components');
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [decodeData, setDecodeData] = useState('');

  const [arrayElement, setArrayElement] = useState<{
    element: any;
    basePath: string[];
    relativePath: string[];
  }>();
  const [openPreciseIgnore, setOpenPreciseIgnore] = useState(false);

  const [referencePath, setReference] = useState<{ path: string[]; value: string }>();

  const jsonDiffViewRef = useRef<DiffJsonViewRef>(null);

  const {
    data: { data: diffMsg, encrypted } = {
      data: {
        id: '',
        categoryName: '',
        operationName: '',
        diffResultCode: 0,
        logInfos: null,
        exceptionMsg: null,
        baseMsg: '',
        testMsg: '',
      },
      encrypted: true,
    },
    loading: loadingDiffMsg,
  } = useRequest(ScheduleService.queryDiffMsgById, {
    defaultParams: [{ id: props.data.id }],
    onSuccess: (data) => {
      props.onChange?.(props.data);
    },
  });

  const {
    data: logEntity,
    loading: loadingLogEntity,
    run: queryLogEntity,
  } = useRequest(
    (logIndex) =>
      ScheduleService.queryLogEntity({
        compareResultId: diffMsg!.id,
        logIndex,
      }),
    {
      manual: true,
      ready: !!diffMsg && props.data.id === diffMsg.id,
      onSuccess: (data) => {
        const leftPath = data.pathPair.leftUnmatchedPath.map((item) => item.nodeName || item.index);
        const rightPath = data.pathPair.rightUnmatchedPath.map(
          (item) => item.nodeName || item.index,
        );
        jsonDiffViewRef.current?.leftScrollTo(leftPath);
        jsonDiffViewRef.current?.rightScrollTo(rightPath);
      },
    },
  );
  useEffect(() => {
    props.defaultActiveFirst &&
      diffMsg?.logInfos?.length &&
      queryLogEntity(diffMsg.logInfos[0].logIndex);
  }, [diffMsg?.id]);

  const handleIgnoreKey = (
    path: string[],
    value: unknown,
    target: TargetEditor,
    type: IgnoreType,
  ) => {
    const filteredPath = jsonIndexPathFilter(
      path,
      target === 'left' ? diffMsg?.baseMsg : diffMsg?.testMsg,
    );
    filteredPath && props.onIgnoreKey?.(filteredPath, type);
  };

  const handlePreciseIgnoreKey = (path: string[], value: unknown, target: TargetEditor) => {
    const json = target === 'left' ? diffMsg?.baseMsg : diffMsg?.testMsg;
    let arrayElement: any = undefined;
    const basePath: string[] = [];
    const relativePath: string[] = [];

    for (let index = path.length - 1; index > 0; index--) {
      const slicedPath = path.slice(0, index);
      const node = getJsonValueByPath(json, slicedPath);

      if (Array.isArray(node)) {
        arrayElement = (node as Array<any>)[Number(path[index])];
        basePath.push(...slicedPath);
        relativePath.push(...path.slice(index + 1));
        break;
      }
    }

    setArrayElement({ element: arrayElement, basePath, relativePath });
    setOpenPreciseIgnore(true);
  };

  const handleCreatePreciseIgnoreKey = () => {
    if (referencePath?.path.length) {
      const fullPath = arrayElement?.basePath
        .concat(`[${referencePath.path.join('/')}=${referencePath.value}]`)
        .concat(arrayElement?.relativePath);

      fullPath && props.onIgnoreKey?.(fullPath, IgnoreType.Interface);
      resetPreciseIgnoreModal();
    } else {
      message.error(t('replayCase.selectReferenceNode'));
    }
  };

  const resetPreciseIgnoreModal = () => {
    setOpenPreciseIgnore(false);
    setReference(undefined);
  };

  const handleSortKey = (path: string[], value: unknown, target: TargetEditor) => {
    const filteredPath = jsonIndexPathFilter(
      path,
      target === 'left' ? diffMsg?.baseMsg : diffMsg?.testMsg,
    );
    filteredPath && props.onSortKey?.(filteredPath);
  };

  const [modal, contextHolder] = Modal.useModal();
  const handleDiffMatch = useCallback(
    (path: string[]) => {
      const text1 = tryStringifyJson(getJsonValueByPath(diffMsg?.baseMsg, path));
      const text2 = tryStringifyJson(getJsonValueByPath(diffMsg?.testMsg, path));

      modal.info({
        footer: false,
        maskClosable: true,
        width: '50%',
        title: t('replay.diffMatch'),
        content: <DiffMatch text1={text1} text2={text2} />,
      });
    },
    [diffMsg, t],
  );
  const handleNodeDecode = (value: string) => {
    try {
      setDecodeData(base64Decode(value));
    } catch (e) {
      console.error(e);
      message.error(t('jsonDiff.failedToDecodeBase64'));
      return;
    }
  };

  const contextMenuRender: OnRenderContextMenu = (path, value, target) => [
    {
      type: 'row',
      items: [
        {
          type: 'column',
          items: [
            {
              type: 'dropdown-button',
              width: '10em',
              main: {
                type: 'button',
                text: t('jsonDiff.ignore')!,
                // disabled: isObjectOrArray(value),
                onClick: () => handleIgnoreKey(path, value, target, IgnoreType.Global),
              },
              items: [
                {
                  type: 'button',
                  text: t('jsonDiff.ignoreToGlobal')!,
                  onClick: () => handleIgnoreKey(path, value, target, IgnoreType.Global),
                },
                {
                  type: 'button',
                  text: t('jsonDiff.ignoreToInterfaceOrDependency')!,
                  onClick: () => handleIgnoreKey(path, value, target, IgnoreType.Interface),
                },
                {
                  type: 'button',
                  text: t('jsonDiff.ignoreTemporary')!,
                  onClick: () => handleIgnoreKey(path, value, target, IgnoreType.Temporary),
                },
                {
                  type: 'button',
                  text: t('jsonDiff.ignorePrecisely')!,
                  onClick: () => handlePreciseIgnoreKey(path, value, target),
                },
              ],
            },
            {
              type: 'button',
              text: t('jsonDiff.sort')!,
              onClick: () => handleSortKey(path, value, target),
            },
            {
              type: 'button',
              text: t('jsonDiff.diffMatch')!,
              onClick: () => handleDiffMatch(path),
            },
            {
              type: 'button',
              text: t('jsonDiff.decode')!,
              onClick: () => handleNodeDecode(value as string),
            },
          ],
        },
      ],
    },
  ];

  return (
    <EmptyWrapper loading={loadingDiffMsg} empty={!diffMsg}>
      <Allotment
        css={css`
          height: ${props.height};
          overflow: visible !important;
          .split-view-view-visible:has(.json-diff-viewer) {
            overflow: visible !important;
          }
        `}
      >
        <Allotment.Pane preferredSize={200}>
          {diffMsg && [0, 2].includes(diffMsg?.diffResultCode) ? (
            <FlexCenterWrapper>
              <Typography.Text type='secondary'>
                {SummaryCodeMap[diffMsg?.diffResultCode].message}
              </Typography.Text>
            </FlexCenterWrapper>
          ) : (
            <>
              <SpaceBetweenWrapper>
                <Typography.Text
                  type='secondary'
                  style={{
                    display: 'inline-block',
                    margin: `${token.marginSM}px 0 0 ${token.margin}px`,
                  }}
                >
                  {t('replay.pointOfDifference')}
                </Typography.Text>
                <Spin
                  size='small'
                  spinning={loadingLogEntity}
                  css={css`
                    margin-right: 8px;
                    span {
                      font-size: 16px !important;
                    }
                  `}
                />
              </SpaceBetweenWrapper>
              <Menu
                defaultSelectedKeys={props.defaultActiveFirst ? ['0'] : undefined}
                items={diffMsg?.logInfos?.map((log, index) => {
                  return {
                    label: <PathTitle diffLog={log} />,
                    key: index,
                  };
                })}
                css={css`
                  height: 100%;
                  overflow-y: auto;
                  padding: 4px 8px 0;
                  .ant-menu-item {
                    height: 26px;
                    line-height: 26px;
                  }
                  border-inline-end: none !important;
                `}
                onClick={({ key }) => {
                  diffMsg?.logInfos?.length &&
                    queryLogEntity(diffMsg.logInfos[parseInt(key)].logIndex);
                }}
              />
            </>
          )}
        </Allotment.Pane>

        <Allotment.Pane
          visible
          className='json-diff-viewer'
          css={css`
            height: ${props.height};
          `}
        >
          {diffMsg?.diffResultCode === 2 ? (
            <FlexCenterWrapper style={{ padding: '16px' }}>
              <Typography.Text type='secondary'>{diffMsg.exceptionMsg}</Typography.Text>
            </FlexCenterWrapper>
          ) : (
            <div style={{ position: 'relative', margin: `${token.marginXS}px`, height: '100%' }}>
              <DiffJsonView
                ref={jsonDiffViewRef}
                height={`calc(${props.height} - 8px)`}
                hiddenValue={encrypted}
                diffJson={{
                  left: diffMsg?.baseMsg || '',
                  right: diffMsg?.testMsg || '',
                }}
                onClassName={(path, value, target) =>
                  logEntity?.pathPair[`${target}UnmatchedPath`]
                    .map((item) => item.nodeName || item.index.toString())
                    .join(',') === path.join(',')
                    ? logEntity?.pathPair.unmatchedType === DIFF_TYPE.UNMATCHED
                      ? 'json-difference-node'
                      : 'json-additional-node'
                    : ''
                }
                onRenderContextMenu={contextMenuRender}
              />
            </div>
          )}
        </Allotment.Pane>
      </Allotment>

      {/* JsonDiffMatchModal */}
      {contextHolder}

      {/* NodeDecodeModal */}
      <Modal
        destroyOnClose
        footer={false}
        open={!!decodeData}
        title={t('base64DecodeContent')}
        onCancel={() => setDecodeData('')}
      >
        <Input.TextArea readOnly value={decodeData} />
      </Modal>

      {/* PreciseIgnoreKeyModal */}
      <Modal
        destroyOnClose
        open={openPreciseIgnore}
        width='60%'
        title={t('replayCase.preciseIgnore')}
        onOk={handleCreatePreciseIgnoreKey}
        onCancel={resetPreciseIgnoreModal}
      >
        <div
          css={css`
            .json-ignore-precisely-node {
              background-color: ${token.colorErrorBgHover};
            }
            .json-ignore-reference-node {
              background-color: ${token.colorSuccessBgHover};
            }
            .json-ignore-precisely-node.json-ignore-reference-node {
              background: linear-gradient(
                to bottom,
                ${token.colorErrorBgHover} 0%,
                ${token.colorErrorBgHover} 50%,
                ${token.colorSuccessBgHover} 50%,
                ${token.colorSuccessBgHover} 100%
              );
            }
          `}
        >
          <Flex style={{ marginBottom: '8px' }}>
            <TagBlock color={token.colorErrorBgHover} title={t('replayCase.preciseIgnoreNode')} />
            <TagBlock color={token.colorSuccessBgHover} title={t('replayCase.referenceNode')} />
          </Flex>

          <JSONEditor
            readOnly
            forceContextMenu
            height='400px'
            content={{ json: arrayElement?.element }}
            onClassName={(path) => {
              if (
                path.join(',') === arrayElement?.relativePath.join(',') &&
                path.join(',') === referencePath?.path.join(',')
              )
                return 'json-ignore-precisely-node json-ignore-reference-node';
              if (path.join(',') === arrayElement?.relativePath.join(','))
                return 'json-ignore-precisely-node';
              if (referencePath?.path.join(',') === path.join(','))
                return 'json-ignore-reference-node';
            }}
            onRenderContextMenu={(items, selection) =>
              isObjectOrArray(selection.value)
                ? []
                : [
                    {
                      type: 'button',
                      text: t('replayCase.setAsReferenceNode') as string,
                      onClick: () => setReference({ path: selection.path, value: selection.value }),
                    },
                  ]
            }
          />
        </div>

        <Flex justify='space-between' align={'center'} style={{ marginTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <Label>{t('replayCase.referenceNodePath')}</Label>
            <Input
              allowClear
              value={referencePath?.path.join('/')}
              onChange={(e) => {
                !e.target.value && setReference(undefined);
              }}
              style={{ width: '60%' }}
            />
          </div>

          <Typography.Text type='secondary'>
            {t('replayCase.selectReferenceNodeTip')}
          </Typography.Text>
        </Flex>
      </Modal>
    </EmptyWrapper>
  );
};

export default CaseDiffViewer;
