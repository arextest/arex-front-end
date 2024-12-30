import { Label, useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Tabs, TabsProps, Tag } from 'antd';
import React, { useState } from 'react';

import CategoryIgnore from '@/panes/AppSetting/CompareConfigNew/CategoryIgnore';
import NodesTransform from '@/panes/AppSetting/CompareConfigNew/NodesTransform';
import { ApplicationService } from '@/services';

import ListSort from './ListSort';
import NodeIgnore from './NodeIgnore';

export type CompareConfigNewProps = {
  appId: string;
  operation?: {
    operationId?: string;
    operationName?: string;
  };
  dependency?: {
    operationName?: string;
    operationType?: string;
  };
};

export default function CompareConfigNew(props: CompareConfigNewProps) {
  const { t } = useTranslation('components');

  const [operation, setOperation] = useState(props.operation);
  const [dependency, setDependency] = useState(props.dependency);

  /**
   * 请求 InterfacesList
   */
  const { data: operationList = [] } = useRequest(
    () => ApplicationService.queryInterfacesList<'Interface'>({ appId: props.appId as string }),
    {
      ready: !!props.appId,
    },
  );

  const compareConfigProps = {
    appId: props.appId,
    operation,
    dependency,
    operationList,
  };

  const compareConfigItems: TabsProps['items'] = [
    {
      key: 'nodeIgnore',
      label: t('appSetting.nodesIgnore'),
      children: <NodeIgnore {...compareConfigProps} />,
    },
    {
      key: 'nodeSort',
      label: t('appSetting.listSort'),
      children: <ListSort {...compareConfigProps} />,
    },
    {
      key: 'categoryIgnore',
      label: t('appSetting.categoryIgnore'),
      children: <CategoryIgnore {...compareConfigProps} />,
    },
    {
      key: 'nodeTransform',
      label: t('appSetting.nodesTransform'),
      children: <NodesTransform {...compareConfigProps} />,
    },
  ];

  return (
    <div>
      <Tabs
        type='card'
        items={compareConfigItems}
        tabBarStyle={{
          margin: '0 12px -1px',
        }}
        tabBarExtraContent={
          <div>
            {(operation || dependency?.operationName) && (
              <Label type='secondary'>{t('common:filter')}</Label>
            )}

            {operation && !dependency?.operationName && (
              <Tag
                closable
                onClose={() => {
                  setOperation(undefined);
                }}
              >
                {t('components:appSetting.entryPoint')}: {props.operation?.operationName}
              </Tag>
            )}

            {dependency?.operationName && (
              <Tag
                closable
                onClose={() => {
                  setOperation(undefined);
                  setDependency(undefined);
                }}
              >
                {t('components:appSetting.dependency')}:
                {`${props.dependency?.operationName} - ${props.dependency?.operationType}`}
              </Tag>
            )}
          </div>
        }
      />
    </div>
  );
}
