import { SaveOutlined, SyncOutlined } from '@ant-design/icons';
import { PaneDrawer, SpaceBetweenWrapper, useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Space, TreeProps, Typography } from 'antd';
import { CarouselRef } from 'antd/lib/carousel';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useImmer } from 'use-immer';

import { ComparisonService, ReportService } from '@/services';
import { DependencyParams, SortNode } from '@/services/ComparisonService';

import ArrayTree from './ArrayTree';
import SortTree from './SortTree';
import TreeCarousel from './TreeCarousel';
import { getSortArray } from './utils';

enum TreeEditModeEnum {
  ArrayTree,
  SortTree,
}

export type AddListSortDrawerProps = {
  appId?: string;
  operationId?: string;
  dependency?: {
    operationType?: string;
    operationName?: string;
  };
  onClose?: () => void;
};

export type AddListSortDrawerRef = {
  open: (sortArrayPath?: string[]) => void;
};
const AddListSortDrawer = forwardRef<AddListSortDrawerRef, AddListSortDrawerProps>((props, ref) => {
  const { message } = App.useApp();
  const { t } = useTranslation(['components', 'common']);

  const treeCarouselRef = React.useRef<CarouselRef>(null);
  const [treeEditMode, setTreeEditMode] = useState<TreeEditModeEnum>(TreeEditModeEnum.ArrayTree);

  const [sortArray, setSortArray] = useState<any[]>();
  const [activeSortNode, setActiveSortNode] = useState<SortNode>();

  const [checkedNodesData, setCheckedNodesData] = useImmer<{
    path?: string;
    pathKeyList: string[];
  }>({ pathKeyList: [] });

  // 控制 SortTree 组件防止在获取到有效的 treeData 数据前渲染，导致 defaultExpandAll 失效
  const [treeReady, setTreeReady] = useState(false);
  const [openSortModal, setOpenSortModal] = useState(false);

  useImperativeHandle(ref, () => ({
    open: async (sortArrayPath) => {
      setOpenSortModal(true);
      const res = await Promise.all([queryContract(), querySortNode()]);
      handleEditCollapseItem(res[0], (sortArrayPath?.join('/') || '') + '/', res[1][0]);
    },
  }));

  const { run: handleSync, loading: syncing } = useRequest(
    () =>
      ReportService.syncResponseContract({
        operationId: props.operationId!,
      }),
    {
      manual: true,
      ready: !!props.operationId,
      onSuccess: (data) => {
        if (data?.dependencyList) {
          queryContract();
        }
      },
    },
  );

  /**
   * 获取 SortNode
   */
  const {
    data: sortNodeList = [],
    loading: loadingSortNode,
    runAsync: querySortNode,
    mutate: setSortNodeList,
  } = useRequest(
    (listPath?: string[]) =>
      ComparisonService.querySortNode({
        appId: props.appId as string,
        operationId: props.operationId,
        ...props.dependency,
      }),
    {
      ready: !!props.appId,
      refreshDeps: [props.operationId, props.dependency],
      onSuccess(res, [listPath]) {
        // 新增 SortNode 时设置 activeSortNode, 防止继续新增
        if (listPath) {
          const pathKey = listPath.join('_');
          // 获取新增的 node
          const node = res.find((node) => node.listPath.join('_') === pathKey);
          node && setActiveSortNode(node);
        }
        // 由于增量调用，取消状态重置
        // props.appId && handleCancelEditResponse(false, false);
      },
    },
  );

  const {
    data: contract,
    loading: loadingContract,
    mutate: setContract,
    runAsync: queryContract,
  } = useRequest(
    () =>
      ReportService.queryContract({
        appId: props.appId!,
        operationId: props.operationId!,
        ...props.dependency,
      }),
    {
      manual: true,
      ready: !!props.operationId && !loadingSortNode,
      refreshDeps: [props.appId, props.operationId, props.dependency],
      onBefore() {
        setContract();
      },
    },
  );

  const SaveSortNodeOptions = {
    manual: true,
    onSuccess(success: boolean) {
      if (success) {
        setOpenSortModal(false);
        // querySortNode();
        // treeCarouselRef.current?.goTo(0);
        message.success('Update successfully');
      } else {
        message.error('Update failed');
      }
    },
  };

  /**
   * 新增 SortNode
   */
  const { run: insertSortNode } = useRequest(ComparisonService.insertSortNode, SaveSortNodeOptions);

  /**
   * 更新 SortNode
   */
  const { run: updateSortNode } = useRequest(ComparisonService.updateSortNode, SaveSortNodeOptions);

  const handleSaveSort = () => {
    const params = {
      listPath: checkedNodesData?.path?.split('/').filter(Boolean) || [],
      keys: checkedNodesData.pathKeyList.map((key) => key?.split('/').filter(Boolean)),
    };
    if (activeSortNode) {
      updateSortNode({ id: activeSortNode.id, ...params });
    } else if (props.appId && props.operationId) {
      const dependencyParams: DependencyParams = {
        operationType: props.dependency?.operationType,
        operationName: props.dependency?.operationName,
        // ...props.dependency,
      };

      insertSortNode({
        appId: props.appId,
        operationId: props.operationId,
        ...params,
        ...dependencyParams,
      });
    }
  };

  /**
   * 点击 PathCollapseItem 或 ArrayTreeItem 时
   * @param path
   * @param sortNode 点击 ArrayTreeItem 新的未配置节点时 sortNode 为 undefined
   */
  const handleEditCollapseItem = (
    contract: Record<string, any>,
    path: string,
    sortNode?: SortNode,
  ) => {
    setActiveSortNode(sortNode);
    setCheckedNodesData((state) => {
      state.path = path;
      state.pathKeyList = sortNode?.pathKeyList || [];
    });

    try {
      const sa = getSortArray(path, contract, false);
      console.log(sa);
      setSortArray(sa);
    } catch (error) {
      console.warn('failed to analytic path');
    }

    setTreeEditMode(TreeEditModeEnum.SortTree);
    setTreeReady(true);

    setTimeout(() => treeCarouselRef.current?.goTo(1)); // 防止初始化时 treeCarouselRef 未绑定
  };

  const handleSortTreeChecked: TreeProps['onCheck'] = (checkedKeys) => {
    setCheckedNodesData((state) => {
      state.pathKeyList = (checkedKeys as { checked: string[]; halfChecked: string[] }).checked;
    });
  };

  const handleSortTreeSelected: TreeProps['onSelect'] = (selectedKeys) => {
    const key = selectedKeys[0] as string;
    if (key) {
      setCheckedNodesData((state) => {
        const includes = state.pathKeyList.includes(key);
        state.pathKeyList = includes
          ? state.pathKeyList.filter((pathKey) => pathKey !== key)
          : [...state.pathKeyList, key];
      });
    }
  };

  /**
   * 取消编辑 nodes sort
   */
  const handleCancelEdit = () => {
    props.onClose?.();
    setTreeEditMode(TreeEditModeEnum.ArrayTree);
    treeCarouselRef.current?.goTo(0);
    setSortArray(undefined);
    setActiveSortNode(undefined);
    setOpenSortModal(false);
  };

  return (
    <PaneDrawer
      width='60%'
      title={
        <SpaceBetweenWrapper>
          <Space size='middle'>
            <Typography.Title level={5} style={{ marginBottom: 0 }}>
              {t('appSetting.nodesSort')}
            </Typography.Title>

            <Button
              size='small'
              disabled={syncing}
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSync}
            >
              {t('appSetting.sync', { ns: 'components' })}
            </Button>
          </Space>
          {treeEditMode === TreeEditModeEnum.SortTree && (
            <Button size='small' type='primary' icon={<SaveOutlined />} onClick={handleSaveSort}>
              {t('save', { ns: 'common' })}
            </Button>
          )}
        </SpaceBetweenWrapper>
      }
      open={openSortModal}
      onClose={handleCancelEdit}
    >
      <TreeCarousel ref={treeCarouselRef} beforeChange={(from, to) => setTreeEditMode(to)}>
        <ArrayTree
          loading={loadingContract && loadingSortNode}
          treeData={contract}
          sortNodeList={sortNodeList}
          onSelect={(selectedKeys) =>
            handleEditCollapseItem(
              contract || {},
              selectedKeys[0] as string,
              sortNodeList.find((node) => node.path === selectedKeys[0]),
            )
          }
        />

        {treeReady && (
          <SortTree
            title={checkedNodesData.path}
            treeData={sortArray}
            checkedKeys={checkedNodesData.pathKeyList}
            onCheck={handleSortTreeChecked}
            onSelect={handleSortTreeSelected}
          />
        )}
      </TreeCarousel>
    </PaneDrawer>
  );
});

export default AddListSortDrawer;
