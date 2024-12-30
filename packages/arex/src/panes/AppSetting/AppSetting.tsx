import {
  ArexPaneFC,
  clearLocalStorage,
  css,
  setLocalStorage,
  useTranslation,
} from '@arextest/arex-core';
import { Badge, Tabs } from 'antd';
import React, { useEffect, useMemo } from 'react';

import { APP_ID_KEY, PanesType } from '@/constant';
import { useNavPane } from '@/hooks';
import CompareConfig from '@/panes/AppSetting/CompareConfig';
import { useMenusPanes } from '@/store';
import { decodePaneKey } from '@/store/useMenusPanes';

import CompareConfigNew from './CompareConfigNew';
import SettingImportYaml from './ImportYaml';
import SettingOther from './Other';
import SettingRecord from './Record';
import SettingReplay from './Replay';

const AppSetting: ArexPaneFC<{ key: string }> = (props) => {
  const { paneKey, data } = props;
  const navPane = useNavPane();
  const { activePane } = useMenusPanes();
  const { id: appId } = useMemo(() => decodePaneKey(paneKey), [paneKey]);
  const { t } = useTranslation(['components']);

  const TabsItems = useMemo(
    () => [
      {
        key: 'record',
        label: t('appSetting.record'),
        children: <SettingRecord appId={appId} />,
      },
      {
        key: 'replay',
        label: t('appSetting.replay'),
        children: <SettingReplay appId={appId} />,
      },
      {
        key: 'compareConfig',
        label: t('appSetting.compareConfig'),
        children: <CompareConfig appId={appId} />,
      },
      {
        key: 'compareConfigNew',
        label: (
          <Badge size='small' count='new' offset={[12, 0]}>
            {t('appSetting.compareConfig')}
          </Badge>
        ),
        children: <CompareConfigNew appId={appId} />,
      },
      {
        key: 'importYaml',
        label: t('appSetting.importYaml'),
        children: <SettingImportYaml appId={appId} />,
      },
      {
        key: 'other',
        label: t('appSetting.other'),
        children: <SettingOther appId={appId} />,
      },
    ],
    [appId, t],
  );

  useEffect(() => {
    activePane?.key === props.paneKey && setLocalStorage(APP_ID_KEY, appId);
    return () => clearLocalStorage(APP_ID_KEY);
  }, [activePane?.id]);

  const handleChange = (key: string) => {
    navPane({
      id: appId,
      type: PanesType.APP_SETTING,
      data: {
        key,
      },
    });
  };

  return (
    <Tabs
      size='small'
      tabPosition='left'
      defaultActiveKey={data?.key}
      items={TabsItems}
      onChange={handleChange}
      css={css`
        height: 100%;
        .ant-tabs-nav-list > .ant-tabs-tab {
          margin: 4px 0 0 0 !important;
        }
        .ant-tabs-tabpane {
          padding: 0 12px;
        }
      `}
    />
  );
};

export default AppSetting;
