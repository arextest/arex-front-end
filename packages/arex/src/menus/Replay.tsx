import { HeartFilled, HeartOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ArexMenuFC,
  createArexMenu,
  getLocalStorage,
  SpaceBetweenWrapper,
  styled,
  TooltipButton,
  useTranslation,
} from '@arextest/arex-core';
import { useRequest, useSize, useToggle } from 'ahooks';
import { Modal, theme } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Icon, MenuSelect, MenuSelectProps } from '@/components';
import { EMAIL_KEY, MenusType, PanesType } from '@/constant';
import AppBasicSetup from '@/panes/AppSetting/Other/AppBasicSetup';
import { ApplicationService, UserService } from '@/services';
import { ApplicationDataType } from '@/services/ApplicationService';
import { useApplication, useMenusPanes } from '@/store';

type MenuItemProps = {
  app: ApplicationDataType;
  favoriteApps?: string[];
  onFavoriteAppsChange?: () => void;
};
const MenuItem = styled((props: MenuItemProps) => {
  const { app, favoriteApps = [], onFavoriteAppsChange, ...restProps } = props;
  const { activePane, setActiveMenu } = useMenusPanes();

  const { token } = theme.useToken();
  const email = getLocalStorage<string>(EMAIL_KEY) as string;

  const { run: favoriteApp } = useRequest(
    () => UserService.setFavoriteApp({ userName: email, favoriteApp: app.id }),
    {
      manual: true,
      onSuccess(res) {
        res && onFavoriteAppsChange?.();
      },
    },
  );

  const { run: unFavoriteApp } = useRequest(
    () => UserService.setUnFavoriteApp({ userName: email, favoriteApp: app.id }),
    {
      manual: true,
      onSuccess(res) {
        res && onFavoriteAppsChange?.();
      },
    },
  );

  useEffect(() => {
    if (activePane && activePane.type === PanesType.REPLAY) {
      setActiveMenu(MenusType.APP);
    }
  }, [activePane]);

  return (
    <SpaceBetweenWrapper {...restProps}>
      <span>{app.appName}</span>
      <span className='menu-item-heart' onClick={(e) => e.stopPropagation()}>
        {favoriteApps.includes(app.id) ? (
          <HeartFilled onClick={unFavoriteApp} style={{ color: token.colorError }} />
        ) : (
          <HeartOutlined className='menu-item-heart-outlined' onClick={favoriteApp} />
        )}
      </span>
    </SpaceBetweenWrapper>
  );
})`
  width: 100%;
  .menu-item-heart {
    .menu-item-heart-outlined {
      opacity: 0;
      transition: opacity ease 0.3s;
    }
  }

  &:hover {
    .menu-item-heart-outlined {
      opacity: 1;
    }
  }
`;

const ReplayMenu: ArexMenuFC = (props) => {
  const { t } = useTranslation(['components']);
  const { activePane } = useMenusPanes();
  const size = useSize(() => document.getElementById('arex-menu-wrapper'));

  const height = useMemo(() => size && size?.height - 88, [size]);

  const { token } = theme.useToken();
  const email = getLocalStorage<string>(EMAIL_KEY) as string;
  const { timestamp } = useApplication();

  const [favoriteFilter, { toggle: toggleFavoriteFilter, setRight: disableFavoriteFilter }] =
    useToggle(false);
  const [favoriteAppsInitialized, setFavoriteAppsInitialized] = useState(false);
  const selectedKeys = useMemo(
    () => (activePane?.type === PanesType.REPLAY && props.value ? [props.value] : []),
    [activePane?.type, props.value],
  );

  const { data: favoriteApps, run: getFavoriteApps } = useRequest(
    () => UserService.getFavoriteApp(email),
    {
      onSuccess(favoriteApps) {
        if (!favoriteAppsInitialized) {
          favoriteApps.length && disableFavoriteFilter();
          setFavoriteAppsInitialized(true);
        }
      },
    },
  );

  const filter = useCallback(
    (keyword: string, app: ApplicationDataType) => {
      const lowCaseKeyword = keyword.toLowerCase();
      return lowCaseKeyword
        ? app.appName.toLowerCase().includes(lowCaseKeyword) || app.appId.includes(lowCaseKeyword)
        : favoriteFilter
        ? !!favoriteApps?.includes(app.id)
        : true;
    },
    [favoriteFilter, favoriteApps],
  );

  const handleSelect: MenuSelectProps<ApplicationDataType, any[]>['onSelect'] = (value) => {
    props.onSelect?.(value); // to streamline the params, remove the types from onSelect handler
  };

  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '8px' }}>
      <MenuSelect<ApplicationDataType>
        small
        refresh
        forceFilter
        rowKey='appId'
        limit={25}
        initValue={props.value}
        selectedKeys={selectedKeys}
        prefix={
          <>
            {!email.startsWith('GUEST') && (
              <TooltipButton
                type='text'
                size='small'
                title={t('applicationsMenu.createApp')}
                icon={<PlusOutlined />}
                onClick={() => setOpen(true)}
              />
            )}

            <TooltipButton
              title={t('applicationsMenu.filterFavoriteApps')}
              icon={
                favoriteFilter ? (
                  <HeartFilled style={{ color: token.colorError }} />
                ) : (
                  <HeartOutlined />
                )
              }
              onClick={toggleFavoriteFilter}
            />
          </>
        }
        onSelect={handleSelect}
        placeholder={t('applicationsMenu.appFilterPlaceholder')}
        request={ApplicationService.getAppList}
        requestOptions={{
          refreshDeps: [timestamp], // refresh when delete app
        }}
        filter={filter}
        itemRender={(app) => ({
          label: (
            <MenuItem
              app={app}
              favoriteApps={favoriteApps}
              onFavoriteAppsChange={getFavoriteApps}
            />
          ),
          key: app.appId,
        })}
        height={height}
        sx={{
          padding: '8px 0',
          '.ant-menu-item': {
            paddingInlineEnd: 0, // 防止在 padding 范围内导致 :hover 失效
          },
        }}
      />

      <Modal
        destroyOnClose
        title={t('applicationsMenu.createApp')}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <AppBasicSetup hidden={{ owners: true }} onCreate={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default createArexMenu(ReplayMenu, {
  type: MenusType.APP,
  paneType: PanesType.REPLAY,
  icon: <Icon name='AppWindow' />,
});
