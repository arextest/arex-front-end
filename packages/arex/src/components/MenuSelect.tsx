import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { css, styled, TooltipButton, useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Options } from 'ahooks/lib/useRequest/src/types';
import { Button, Input, Menu, Spin, Typography } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { ChangeEventHandler, ReactNode, useCallback, useMemo, useState } from 'react';

export type MenuSelectProps<D, P extends any[]> = {
  sx?: any; // custom style // types: CSSInterpolation / @emotion/serialize/types
  small?: boolean;
  refresh?: boolean; // show refresh button
  defaultSelectFirst?: boolean;
  limit?: number;
  height?: number;
  prefix?: ReactNode; // icon beside search input
  initValue?: string;
  rowKey: string; // key name in D
  selectedKeys?: string[];
  onSelect?: (id: string, app?: D) => void;
  onClick?: (info: any) => void;
  filter?: ((keyword: string, app: D) => boolean) | string;
  forceFilter?: boolean; // filtering even if the keyword is empty
  request: () => Promise<D[]>;
  requestOptions?: Options<D[], P>; // ahooks request options
  placeholder?: string; // from i18n namespace "components"
  itemRender?: (app: D, index: number) => { label: ReactNode; key: React.Key };
};

const MenuList = styled(Menu, {
  shouldForwardProp: (propName) => propName !== 'small',
})<{
  small?: boolean;
}>`
  border: none !important;
  background: transparent !important;
  .ant-menu-title-content {
    width: 100%;
  }
  .ant-menu-item {
    color: ${(props) => props.theme.colorTextSecondary}!important;
    padding-left: 8px;
    padding-right: 8px;
    height: ${(props) => (props.small ? '24px' : '28px')};
    line-height: ${(props) => (props.small ? '24px' : '28px')};
    background: transparent !important;
  }
  .ant-menu-item-active,
  .ant-menu-item-selected {
    color: ${(props) => props.theme.colorText}!important;
  }
  .ant-menu-item-active {
    background-color: ${(props) => props.theme.colorFillTertiary} !important;
  }
  .ant-menu-item-selected {
    background-color: ${(props) => props.theme.colorPrimaryBgHover} !important;
  }
`;

type MenuFilterProps = {
  refresh?: boolean;
  prefix?: ReactNode;
  size?: SizeType;
  value: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onFresh?: () => void;
  className?: string;
};
const MenuFilter = styled((props: MenuFilterProps) => {
  const { t } = useTranslation();
  return (
    <div className={props.className}>
      <span className='button-group'>
        {props.prefix}
        {props.refresh && (
          <TooltipButton
            title={t('refresh')}
            size={props.size}
            icon={<SyncOutlined />}
            onClick={props.onFresh}
          />
        )}
      </span>

      <Input
        prefix={<SearchOutlined />}
        size={props.size}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
        style={{ flex: 1 }}
      />
    </div>
  );
})`
  margin: 2px 0 6px 0;
  display: flex !important;
  .button-group {
    margin-right: 2px;
    .ant-btn-icon-only {
      color: ${(props) => props.theme.colorTextSecondary} !important;
    }
  }
`;

function MenuSelect<D extends { [key: string]: any }, P extends any[] = []>(
  props: MenuSelectProps<D, P>,
) {
  const { t } = useTranslation('components');

  const [selectedKey, setSelectedKey] = useState<string>();
  const selectedKeys = useMemo(
    () => props.selectedKeys || (selectedKey ? [selectedKey] : undefined),
    [props.selectedKeys, selectedKey],
  );

  const [hiddenCount, setHiddenCount] = useState(0);
  const [limitCount, setLimitCount] = useState(props.limit);

  const [filterKeyword, setFilterKeyword] = useState('');

  const filter = useCallback(
    (data: D[]) =>
      data.filter((app) => {
        if (typeof props.filter === 'string') {
          return app[props.filter].toLocaleLowerCase().includes(filterKeyword.toLocaleLowerCase());
        } else {
          return props.filter && props.filter(filterKeyword, app);
        }
      }),
    [filterKeyword, props],
  );
  const {
    data: apps,
    loading,
    run: reload,
  } = useRequest<D[], P>(props.request, {
    ...props.requestOptions,
    onSuccess(res, _params) {
      // 默认触发onSelect第一个的逻辑
      if (res.length && (props.defaultSelectFirst || props.initValue)) {
        const record = props.defaultSelectFirst
          ? props.forceFilter
            ? filter(res)[0]
            : res[0]
          : res.find((i) => i.id === props.initValue);

        if (record) {
          setSelectedKey(record[props.rowKey]);
          props.onSelect?.(record[props.rowKey], record);
        }
      }
      props.requestOptions?.onSuccess?.(_params);
    },
  });

  const filteredApps = useMemo<ItemType[]>(() => {
    const _app = apps || [];
    const filtered = (props.forceFilter || filterKeyword) && props.filter ? filter(_app) : _app;
    const limitApp = typeof props.limit === 'number' ? filtered.slice(0, limitCount) : filtered;
    setHiddenCount(filtered.length - limitApp.length);
    return limitApp.map<ItemType>(
      props.itemRender
        ? props.itemRender
        : (app) => ({
            label: app[props.rowKey],
            key: app[props.rowKey],
          }),
    );
  }, [filterKeyword, props, apps, limitCount]);

  const handleAppMenuClick = (value: { key: string }) => {
    const app: D | undefined = apps?.find((app) => app[props.rowKey] === value.key);
    if (app) {
      props.onSelect?.(value.key, app);
      setSelectedKey(app[props.rowKey]);
    }
  };
  return (
    <Spin spinning={loading} css={css(props.sx)}>
      {/* 目前刷新按钮的显示受限于搜索逻辑 */}
      {props.filter && (
        <MenuFilter
          refresh={props.refresh}
          prefix={props.prefix}
          size={props.small ? 'small' : 'middle'}
          value={filterKeyword}
          placeholder={props.placeholder && (t(props.placeholder) as string)}
          onChange={(e) => setFilterKeyword(e.target.value)}
          onFresh={reload}
        />
      )}
      <div
        className='list-wrapper'
        css={css`
          overflow: auto;
          height: ${props.height && props.height + 'px'};
        `}
      >
        <MenuList
          small={props.small}
          selectedKeys={selectedKeys}
          items={filteredApps}
          onClick={handleAppMenuClick}
        />
        {hiddenCount > 0 && (
          <div style={{ textAlign: 'center' }}>
            <Button
              size='small'
              type='text'
              onClick={() => props.limit && setLimitCount((limitCount as number) + props.limit)}
            >
              <Typography.Text type='secondary'>{hiddenCount} more ...</Typography.Text>
            </Button>
          </div>
        )}
      </div>
    </Spin>
  );
}

export default MenuSelect;
