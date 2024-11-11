import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Form, Pagination, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useRef, useState } from 'react';

import AddConfigModal, {
  AddConfigModalProps,
  AddConfigModalRef,
  parseDependency,
} from '@/panes/AppSetting/CompareConfigNew/AddConfigModal';
import IgnorePathInput from '@/panes/AppSetting/CompareConfigNew/NodeIgnore/IgnorePathInput';
import { ComparisonService } from '@/services';
import { IgnoreNodeBase, PageQueryComparisonReq } from '@/services/ComparisonService';

import ConfigInfoTable, { CONFIG_INFO_TABLE_MODE } from '../ConfigInfoTable';
import { ExclusionInfo } from '../type';

type NodeIgnorePrivate = {
  exclusions: string;
};

export type NodeIgnoreProps = { appId: string } & Pick<
  AddConfigModalProps<NodeIgnorePrivate>,
  'operationList'
>;

const PAGE_SIZE = {
  SIZE_10: 10,
  SIZE_20: 20,
  SIZE_30: 30,
};

const pageSizeOptions = Object.values(PAGE_SIZE);

export default function NodeIgnore(props: NodeIgnoreProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const addConfigModalRef = useRef<AddConfigModalRef>(null);

  const [tableMode, setTableMode] = useState<CONFIG_INFO_TABLE_MODE>(
    CONFIG_INFO_TABLE_MODE.DISPLAY,
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE.SIZE_10,
  });

  const [searchParams, setSearchParams] = useState<
    Pick<PageQueryComparisonReq, 'operationIds' | 'dependencyIds'>
  >({});

  const [selectedRows, setSelectedRows] = useState<ExclusionInfo[]>([]);

  const columns: ColumnsType<ExclusionInfo> = [
    {
      title: t('components:appSetting.path'),
      dataIndex: 'exclusionPath',
      render: (path: string[]) => '/ ' + path.join(' / '),
    },
  ];

  const {
    data = { totalCount: 0, exclusions: [] },
    loading,
    run: queryAggregateIgnoreNode,
  } = useRequest(
    () =>
      ComparisonService.queryAggregateIgnoreNode({
        appId: props.appId,
        pageSize: pagination.pageSize,
        pageIndex: pagination.current,
        ...searchParams,
      }),
    {
      refreshDeps: [pagination, searchParams],
    },
  );

  /**
   * 批量删除 IgnoreNode
   */
  const { run: batchDeleteIgnoreNode } = useRequest(ComparisonService.batchDeleteIgnoreNode, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('common:message.delSuccess'));
        setTableMode(CONFIG_INFO_TABLE_MODE.DISPLAY);
        queryAggregateIgnoreNode();
      } else {
        message.error(t('common:message.delFailed'));
      }
    },
  });

  const { run: insertIgnoreNode } = useRequest(ComparisonService.insertIgnoreNode, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.updateSuccess', { ns: 'common' }));
        addConfigModalRef.current?.close();
        queryAggregateIgnoreNode();
      } else {
        message.error(t('message.updateFailed', { ns: 'common' }));
      }
    },
  });

  function handleSearch(search: Record<string, string | undefined>) {
    if (pagination.current !== 1) {
      setPagination({ current: 1, pageSize: pagination.pageSize });
    }

    const operationIds: PageQueryComparisonReq['operationIds'] = [];
    const dependencyIds: PageQueryComparisonReq['dependencyIds'] = [];
    const operationNameSearchLowerCase = search['operationName']?.toLowerCase() || '';
    const dependencyNameSearchLowerCase = search['dependencyName']?.toLowerCase() || '';

    if (operationNameSearchLowerCase && 'global'.includes(operationNameSearchLowerCase))
      operationIds.push(null);

    props.operationList?.forEach((operation) => {
      if (
        operationNameSearchLowerCase &&
        operation.operationName.toLowerCase().includes(operationNameSearchLowerCase)
      )
        operationIds.push(operation.id);
      operation.dependencyList?.forEach((dependency) => {
        if (
          dependencyNameSearchLowerCase &&
          dependency.operationName?.toLowerCase()?.includes(dependencyNameSearchLowerCase)
        )
          dependencyIds.push(dependency.dependencyId);
      });
    });

    setSearchParams({
      operationIds,
      dependencyIds,
    });
  }

  function handleDelete() {
    batchDeleteIgnoreNode(selectedRows.map((row) => ({ id: row.id })));
  }

  const TableFooter = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        {data.totalCount > pagination.pageSize && (
          <Pagination
            total={data.totalCount}
            current={pagination.current}
            pageSize={pagination.pageSize}
            pageSizeOptions={pageSizeOptions}
            onChange={(page, pageSize) => {
              setPagination({
                current: page,
                pageSize,
              });
            }}
          />
        )}
      </div>

      <div>
        {tableMode === CONFIG_INFO_TABLE_MODE.DISPLAY ? (
          <>
            <Button
              type='text'
              icon={<PlusOutlined />}
              onClick={() => addConfigModalRef.current?.open()}
            >
              {t('common:add')}
            </Button>
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => setTableMode(CONFIG_INFO_TABLE_MODE.EDIT)}
            >
              {t('common:edit')}
            </Button>
          </>
        ) : (
          // tableMode === CONFIG_INFO_TABLE_MODE.EDIT
          <>
            <Button
              type='text'
              icon={<CloseOutlined />}
              onClick={() => setTableMode(CONFIG_INFO_TABLE_MODE.DISPLAY)}
            >
              {t('common:cancel')}
            </Button>
            <Popconfirm title={t('components:appSetting.confirmDelete')} onConfirm={handleDelete}>
              <Button danger type='text' icon={<DeleteOutlined />} disabled={!selectedRows?.length}>
                {t('common:delete')}
              </Button>
            </Popconfirm>
          </>
        )}
      </div>
    </div>
  );

  const handleAddIgnore: AddConfigModalProps<NodeIgnorePrivate>['onSubmit'] = (form) =>
    form
      .validateFields()
      .then((res) => {
        const { dependency, exclusions, ...rest } = res;
        const params = {
          ...rest,
          ...parseDependency(dependency),
          exclusions: exclusions?.split('/').filter(Boolean),
        } as IgnoreNodeBase;
        insertIgnoreNode(params);
      })
      .catch((e) => {
        console.log(e);
      });

  return (
    <div>
      <ConfigInfoTable<ExclusionInfo>
        rowKey='id'
        requestSearch
        loading={loading}
        columns={columns}
        dataSource={data?.exclusions}
        footer={TableFooter}
        rowSelection={
          tableMode !== CONFIG_INFO_TABLE_MODE.DISPLAY
            ? {
                onSelect: (record, selected, selectedRows) => {
                  setSelectedRows(selectedRows.filter(Boolean));
                },
              }
            : undefined
        }
        onSearch={handleSearch}
      />

      <AddConfigModal<NodeIgnorePrivate>
        ref={addConfigModalRef}
        title={t('components:appSetting.nodesIgnore')}
        appId={props.appId}
        operationList={props.operationList}
        field={({ appId, operationId, dependency }) => (
          <Form.Item
            name='exclusions'
            label={t('components:appSetting.path')}
            rules={[{ required: true }]}
          >
            <IgnorePathInput appId={appId} operationId={operationId} dependency={dependency} />
          </Form.Item>
        )}
        onSubmit={handleAddIgnore}
      />
    </div>
  );
}
