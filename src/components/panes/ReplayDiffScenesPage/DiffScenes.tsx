import { StopOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRequest } from 'ahooks';
import { Allotment } from 'allotment';
import { App, Menu, theme, Typography } from 'antd';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppSettingService from '../../../services/AppSetting.service';
import { CompareResultDetail, DiffLog, PathPair } from '../../../services/Replay.type';
import { TooltipButton } from '../../index';
import DiffJsonView, { DiffJsonViewProps } from '../../replay/Analysis/DiffJsonView';
import { FlexCenterWrapper, Label, SpaceBetweenWrapper } from '../../styledComponents';
import { SummaryCodeMap } from './index';

export interface DiffScenesProps extends Pick<DiffJsonViewProps, 'hiddenTooltip'> {
  operationId: string;
  appId: string;
  data: CompareResultDetail;
  height?: string;
}

const defaultPath = 'root';

interface PathTitleProps {
  pathPair: PathPair;
  onIgnore?: (pathPair: PathPair) => void;
}
const PathTitle = styled((props: PathTitleProps) => {
  const { t } = useTranslation(['components']);

  const pathTitle = useCallback((pathPair: PathPair) => {
    const path =
      pathPair.leftUnmatchedPath.length >= pathPair.rightUnmatchedPath.length
        ? pathPair.leftUnmatchedPath
        : pathPair.rightUnmatchedPath;
    return (
      path.reduce((title, curPair, index) => {
        index && (title += '.');
        title += curPair.nodeName || `[${curPair.index}]`;
        return title;
      }, '') || defaultPath
    );
  }, []);

  return (
    <SpaceBetweenWrapper {...props}>
      <Typography.Text style={{ color: 'inherit' }}>{pathTitle(props.pathPair)}</Typography.Text>
      <TooltipButton
        size='small'
        color='primary'
        placement='right'
        icon={<StopOutlined />}
        title={t('replay.ignoreNode')}
        className='menu-item-stop-outlined'
        onClick={() => props.onIgnore?.(props.pathPair)}
      />
    </SpaceBetweenWrapper>
  );
})`
  height: 100%;
  .menu-item-stop-outlined {
    padding-right: 8px;
    opacity: 0;
    transition: opacity ease 0.3s;
  }

  &:hover {
    .menu-item-stop-outlined {
      opacity: 1;
    }
  }
`;

const DiffScenes: FC<DiffScenesProps> = (props) => {
  const { t } = useTranslation(['components']);
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [activeLog, setActiveLog] = useState<DiffLog>();

  useEffect(() => {
    props.data?.logs?.length && setActiveLog((props.data.logs as DiffLog[])[0]);
  }, [props.data]);

  const diffJsonData = useMemo<DiffJsonViewProps['data']>(
    () =>
      props.data?.diffResultCode
        ? activeLog
          ? {
              baseMsg: props.data.baseMsg,
              testMsg: props.data.testMsg,
              logs: [activeLog],
            }
          : undefined
        : {
            baseMsg: props.data.baseMsg,
            testMsg: props.data.testMsg,
            logs: [],
          },
    [props.data, activeLog],
  );

  const { run: insertIgnoreNode } = useRequest(
    (path) =>
      AppSettingService.insertIgnoreNode({
        operationId: props.operationId,
        appId: props.appId,
        exclusions: path,
      }),
    {
      manual: true,
      onSuccess(success) {
        if (success) {
          message.success(t('replay.addIgnoreSuccess'));
        }
      },
    },
  );

  function handleIgnoreNode(pathPair: DiffLog['pathPair']) {
    const unmatchedType = pathPair.unmatchedType;
    const path = pathPair[unmatchedType === 2 ? 'rightUnmatchedPath' : 'leftUnmatchedPath']
      .map((p) => p.nodeName)
      .filter(Boolean);

    insertIgnoreNode(path);
  }

  if (!props.data) return null;

  return (
    <Allotment
      css={css`
        height: ${props.height};
      `}
    >
      <Allotment.Pane preferredSize={200}>
        {[0, 2].includes(props.data?.diffResultCode) ? (
          <FlexCenterWrapper>
            <Typography.Text type='secondary'>
              {SummaryCodeMap[props.data?.diffResultCode].message}
            </Typography.Text>
          </FlexCenterWrapper>
        ) : (
          <>
            <Typography.Text
              style={{
                display: 'inline-block',
                margin: `0 ${token.margin}px`,
                lineHeight: '30px',
              }}
            >
              {t('replay.pointOfDifference')}
            </Typography.Text>
            <Menu
              defaultSelectedKeys={['0']}
              items={props.data.logs?.map((log, index) => {
                return {
                  label: <PathTitle pathPair={log.pathPair} onIgnore={handleIgnoreNode} />,
                  key: index,
                };
              })}
              css={css`
                height: 100%;
                padding: 4px 8px 0;
                .ant-menu-item {
                  height: 26px;
                  line-height: 26px;
                }
                border-inline-end: none !important;
              `}
              onClick={({ key }) => {
                props.data && setActiveLog((props.data.logs as DiffLog[])[parseInt(key)]);
              }}
            />
          </>
        )}
      </Allotment.Pane>

      <Allotment.Pane
        visible
        css={css`
          height: calc(${props.height} - 48px);
          border-left: 1px solid ${token.colorBorderBg};
        `}
      >
        {props.data?.diffResultCode === 2 ? (
          <FlexCenterWrapper>
            <Typography.Text type='secondary'>{props.data.logs?.[0].logInfo}</Typography.Text>
          </FlexCenterWrapper>
        ) : (
          diffJsonData && (
            <>
              <Typography.Text
                strong
                style={{
                  display: 'inline-block',
                  margin: `${token.marginXS}px ${token.margin}px 0`,
                }}
              >
                <Label>{props.data.categoryName}</Label>
                <Typography.Text strong ellipsis>
                  {props.data.operationName}
                </Typography.Text>
              </Typography.Text>
              <div style={{ position: 'relative', margin: `${token.marginXS}px`, height: '100%' }}>
                <DiffJsonView
                  hiddenTooltip={props.hiddenTooltip}
                  height={props.height}
                  data={diffJsonData}
                />
              </div>
            </>
          )
        )}
      </Allotment.Pane>
    </Allotment>
  );
};

export default DiffScenes;
