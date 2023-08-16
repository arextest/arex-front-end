import { tryParseJsonString, tryPrettierJsonString, useTranslation } from '@arextest/arex-core';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useRequest } from 'ahooks';
import { App, Select, SelectProps, Space, Typography } from 'antd';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Segmented } from '@/components';
import NodesIgnore from '@/panes/AppSetting/CompareConfig/NodesIgnore';
import NodesSort from '@/panes/AppSetting/CompareConfig/NodesSort';
import { ApplicationService, ReportService } from '@/services';
import { DependencyParams } from '@/services/ComparisonService';

import SyncContract from './SyncContract';

export enum CONFIG_TARGET {
  GLOBAL,
  INTERFACE,
  DEPENDENCY,
}

export enum CONFIG_TYPE {
  NODE_IGNORE,
  NODE_SORT,
  // NODE_Encryption,
  // TYPE_IGNORE,
}

// TODO 类型定义抽离封装
export type CompareConfigProps = {
  appId: string; // 限定应用，用于展示特定应用下所有接口的对比配置
  operationId?: string | false; // 限定接口，用于展示特定接口的对比配置, false 时不展示 operationType
  dependency?: DependencyParams; // 限定依赖，用于展示特定依赖的对比配置, undefined 时展示所有 dependency 选项, false 时不展示 dependency 选项
  readOnly?: boolean; // 只读模式，用于展示接口的对比配置
  sortArrayPath?: string[]; // 指定数组节点排序配置的数组节点路径
  onIgnoreDrawerClose?: () => void;
  onSortDrawerClose?: () => void;
};

const CompareConfig: FC<CompareConfigProps> = (props) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [menuAnimateParent] = useAutoAnimate();
  const [configAnimateParent] = useAutoAnimate();

  const configTargetOptions = useMemo(() => {
    const options = [
      {
        label: 'Global',
        value: CONFIG_TARGET.GLOBAL,
      },
    ];

    if (props.operationId !== false) {
      options.push({
        label: 'Interface',
        value: CONFIG_TARGET.INTERFACE,
      });
    }

    if (props.dependency !== false) {
      options.push({
        label: 'Dependency',
        value: CONFIG_TARGET.DEPENDENCY,
      });
    }

    return options;
  }, [props.operationId, props.dependency]);
  const [configTargetValue, setConfigTargetValue] = useState<CONFIG_TARGET>(CONFIG_TARGET.GLOBAL);

  const configTypeOptions = useMemo(() => {
    const options = [
      {
        label: 'NodeIgnore',
        value: CONFIG_TYPE.NODE_IGNORE,
      },
    ];

    if (configTargetValue !== CONFIG_TARGET.GLOBAL) {
      options.push({
        label: 'NodeSort',
        value: CONFIG_TYPE.NODE_SORT,
      });
    }

    return options;
  }, [configTargetValue]);
  const [configTypeValue, setConfigTypeValue] = useState<CONFIG_TYPE>(CONFIG_TYPE.NODE_IGNORE);

  const [activeOperationId, setActiveOperationId] = useState<string | undefined>(
    props.operationId || undefined,
  );
  const [activeDependency, setActiveDependency] = useState<DependencyParams | undefined>(
    props.dependency,
  );

  // 当组件初始化时，根据 props.operationId 和 props.dependencyId 设置 configType
  useEffect(() => {
    if (props.dependency) {
      setConfigTargetValue(CONFIG_TARGET.DEPENDENCY);
      setActiveDependency(props.dependency);
    } else if (props.operationId) {
      setConfigTargetValue(CONFIG_TARGET.INTERFACE);
    }
  }, [props.operationId, props.dependency]);

  const [rawContract, setRawContract] = useState<string>();

  /**
   * 请求 InterfacesList
   */
  const { data: operationList = [] } = useRequest(
    () => ApplicationService.queryInterfacesList<'Interface'>({ id: props.appId as string }),
    {
      ready: !!props.appId,
      onSuccess(res) {
        !props.operationId && setActiveOperationId(res?.[0]?.id);
      },
    },
  );
  const interfaceOptions = useMemo(
    () =>
      operationList.map((operation) => ({
        label: operation.operationName,
        value: operation.id,
      })),
    [operationList],
  );

  /**
   * 请求 DependencyList
   */
  const { loading: loadingDependency } = useRequest(
    () => ApplicationService.getDependencyList({ operationId: activeOperationId as string }),
    {
      ready: !!activeOperationId,
      refreshDeps: [activeOperationId],
      onSuccess(res) {
        const dependencyList = res.dependencyList;
        !props.dependency &&
          dependencyList.length &&
          setActiveDependency({
            operationType: dependencyList?.[0]?.operationType,
            operationName: dependencyList?.[0]?.operationName,
          });
        setDependencyOptions(
          dependencyList.map((dependency) => ({
            label: dependency.operationType + '-' + dependency.operationName,
            value: dependency.operationType + '-' + dependency.operationName,
          })),
        );
      },
    },
  );

  const [dependencyOptions, setDependencyOptions] = useState<SelectProps['options']>();

  /**
   * 更新 Contract
   */
  const { run: updateContract } = useRequest(ReportService.overwriteContract, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.updateSuccess', { ns: 'common' }));
      } else {
        message.error(t('message.updateFailed', { ns: 'common' }));
      }
    },
  });

  const { run: handleSync, loading: syncing } = useRequest(
    () =>
      ReportService.syncResponseContract({
        operationId: activeOperationId as string,
      }),
    {
      manual: true,
      ready: !!activeOperationId,
      onSuccess: (data) => {
        if (data?.dependencyList) {
          setDependencyOptions(
            data.dependencyList.map((dependency) => ({
              label: dependency.operationType + '-' + dependency.operationName,
              value: dependency.operationType + '-' + dependency.operationName,
            })),
          );
        }
      },
    },
  );

  /**
   * 请求 Contract
   */
  const {
    data: contract,
    mutate: setContract,
    loading: loadingContract,
    run: queryContract,
  } = useRequest(
    () =>
      ReportService.queryContract({
        appId: props.appId,
        operationId: activeOperationId,
        ...(configTargetValue === CONFIG_TARGET.DEPENDENCY ? activeDependency : {}),
      }),
    {
      ready: !!props.appId && !syncing,
      refreshDeps: [props.sortArrayPath, configTargetValue, syncing], // TODO 目前可能有一些多余的无效请求，待优化
      onBefore() {
        setContract();
        setRawContract(undefined);
      },
      onSuccess(res) {
        setRawContract(tryPrettierJsonString(res?.contract || ''));
      },
    },
  );

  const contractParsed = useMemo<{ [key: string]: any }>(() => {
    const res = contract?.contract;
    if (res) return tryParseJsonString(res) || {};
    else return {};
  }, [contract]);

  const dependencyValue = useMemo(
    () =>
      activeDependency && (activeDependency.operationType || activeDependency.operationName)
        ? activeDependency.operationType + '-' + activeDependency.operationName //TODO null
        : undefined,
    [activeDependency],
  );

  const handleSaveContract = (value?: string) => {
    let params = {
      appId: props.appId,
      operationResponse: value || '',
    };
    if (configTargetValue === CONFIG_TARGET.INTERFACE) {
      params = Object.assign(params, {
        operationId: activeOperationId,
      });
    }
    if (configTargetValue === CONFIG_TARGET.DEPENDENCY && activeDependency) {
      params = Object.assign(params, {
        operationId: activeOperationId,
        operationType: activeDependency.operationType,
        operationName: activeDependency.operationName,
      });
    }

    updateContract(params);
  };

  const handleConfigTypeChange = useCallback(
    (value: React.Key) => setConfigTypeValue(value as CONFIG_TYPE),
    [],
  );

  const handleConfigTargetChange = useCallback((value: React.Key) => {
    if (value === CONFIG_TARGET.GLOBAL) setConfigTypeValue(CONFIG_TYPE.NODE_IGNORE);
    setConfigTargetValue(value as CONFIG_TARGET);
  }, []);

  return (
    <Space size='middle' direction='vertical' style={{ display: 'flex' }}>
      <Space
        key='config-menu'
        ref={menuAnimateParent}
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        <div key='config-type'>
          <div>
            <Typography.Text type='secondary'>Type : </Typography.Text>
          </div>
          <Segmented
            value={configTypeValue}
            options={configTypeOptions}
            onChange={handleConfigTypeChange}
          />
        </div>

        <div key='config-target'>
          <div>
            <Typography.Text type='secondary'>Target </Typography.Text>
          </div>
          <Segmented
            value={configTargetValue}
            options={configTargetOptions}
            onChange={handleConfigTargetChange}
          />
        </div>

        {configTargetValue !== CONFIG_TARGET.GLOBAL && (
          <div key='interface-select'>
            <div>
              <Typography.Text type='secondary'>Interface :</Typography.Text>
            </div>
            <Select
              optionFilterProp='label'
              placeholder='choose interface'
              popupMatchSelectWidth={false}
              // START 指定 operationId 时，Select 只读
              showSearch={!props.operationId}
              bordered={!props.operationId}
              showArrow={!props.operationId}
              open={props.operationId ? false : undefined}
              // END 指定 operationId 时，Select 只读
              options={interfaceOptions}
              value={activeOperationId}
              onChange={setActiveOperationId}
              style={{ width: '160px' }}
            />
          </div>
        )}

        {configTargetValue === CONFIG_TARGET.DEPENDENCY && (
          <div key='dependency-select'>
            <div>
              <Typography.Text type='secondary'>Dependency : </Typography.Text>
            </div>
            <Select
              optionFilterProp='label'
              placeholder='choose external dependency'
              popupMatchSelectWidth={false}
              // START 指定 operationId 时，Select 只读
              showSearch={!props.dependency}
              bordered={!props.dependency}
              showArrow={!props.dependency}
              open={props.dependency ? false : undefined}
              // END 指定 operationId 时，Select 只读
              loading={loadingDependency}
              options={dependencyOptions}
              value={dependencyValue}
              onChange={(value) => {
                const [operationType, operationName] = value.split('-');
                setActiveDependency({
                  operationType,
                  operationName,
                });
              }}
              style={{ width: '160px' }}
            />
          </div>
        )}

        <div key='syncButtons'>
          <br />
          <SyncContract
            syncing={syncing}
            value={rawContract}
            buttonsDisabled={{ leftButton: syncing || configTargetValue === CONFIG_TARGET.GLOBAL }}
            onSync={handleSync}
            onEdit={queryContract}
            onSave={handleSaveContract}
          />
        </div>
      </Space>

      <div ref={configAnimateParent}>
        {configTypeValue === CONFIG_TYPE.NODE_IGNORE && (
          <NodesIgnore
            key='nodes-ignore'
            appId={props.appId}
            operationId={activeOperationId}
            dependency={activeDependency}
            readOnly={props.readOnly}
            syncing={syncing}
            loadingContract={loadingContract}
            configTarget={configTargetValue}
            contractParsed={contractParsed}
            onAdd={queryContract}
            onSync={handleSync}
            onClose={props.onIgnoreDrawerClose}
          />
        )}

        {configTypeValue === CONFIG_TYPE.NODE_SORT && (
          <NodesSort
            key='nodes-sort'
            appId={props.appId}
            operationId={activeOperationId}
            dependency={activeDependency}
            readOnly={props.readOnly}
            syncing={syncing}
            sortArrayPath={props.sortArrayPath}
            loadingContract={loadingContract}
            configTarget={configTargetValue}
            contractParsed={contractParsed}
            onAdd={queryContract}
            onSync={handleSync}
            onClose={props.onSortDrawerClose}
          />
        )}
      </div>
    </Space>
  );
};

export default CompareConfig;
