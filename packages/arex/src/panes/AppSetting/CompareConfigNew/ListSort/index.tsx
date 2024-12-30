import { CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { css, useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Pagination, Popconfirm, Select, Tag, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import { SearchHighLight } from '@/components';
import { CompareConfigNewProps } from '@/panes/AppSetting/CompareConfigNew';
import { ComparisonService } from '@/services';
import { QuerySortSearchParams, SortNodeBase } from '@/services/ComparisonService';

import { AddConfigModalProps, AddConfigModalRef, parseDependency } from '../AddConfigModal';
import ConfigInfoTable, { CONFIG_INFO_TABLE_MODE, ConfigColumnsType } from '../ConfigInfoTable';
import { ListSortInfo } from '../type';

type ListSortPrivate = {
  listPath: string;
  keys: string[];
};

export type ListSortProps = CompareConfigNewProps &
  Pick<AddConfigModalProps<ListSortPrivate>, 'operationList'>;

const PAGE_SIZE = {
  SIZE_10: 10,
  SIZE_20: 20,
  SIZE_30: 30,
};

const pageSizeOptions = Object.values(PAGE_SIZE);

export default function ListSort(props: ListSortProps) {
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

  const [searchParams, setSearchParams] = useState<QuerySortSearchParams>({});

  useEffect(() => {
    handleSearch({
      operationName: props.operation?.operationName,
      dependencyName: props.dependency?.operationName,
    });
  }, [props.operation, props.dependency, props.operationList]);

  const [selectedRows, setSelectedRows] = useState<ListSortInfo[]>([]);

  const {
    data = { totalCount: 0, listSorts: [] },
    loading,
    run: queryAggregateSortNode,
  } = useRequest(
    () =>
      ComparisonService.queryAggregateSortNode({
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
   * 新增 SortNode
   */
  const { run: insertSortNode } = useRequest(ComparisonService.insertSortNode, {
    manual: true,
    onSuccess(success: boolean) {
      if (success) {
        addConfigModalRef.current?.close();
        queryAggregateSortNode();
        message.success(t('components:replay.compareConfigSuccess'));
      } else {
        message.error('common:message.createFailed');
      }
    },
  });

  /**
   * 删除 SortNode
   */
  const { run: deleteSortNode } = useRequest(ComparisonService.deleteSortNode, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.delSuccess', { ns: 'common' }));
        addConfigModalRef.current?.close();
        queryAggregateSortNode();
      } else {
        message.error(t('message.delFailed', { ns: 'common' }));
      }
    },
  });

  const columns: ConfigColumnsType<ListSortInfo> = [
    {
      title: t('components:appSetting.path'),
      dataIndex: 'listPath',
      search: true,
      render: (path: string[]) => (
        <SearchHighLight text={'/' + path.join('/')} keyword={searchParams.keyOfListPath} />
      ),
    },
    {
      title: t('components:appSetting.keys'),
      dataIndex: 'keys',
      search: true,
      render: (keys: string[][]) => {
        const maxTagCount = searchParams.keyOfValue ? undefined : 2;
        return (
          <Select
            open={false}
            suffixIcon={null}
            removeIcon={null}
            variant='borderless'
            mode='multiple'
            value={keys.map((key) => '/' + key.join('/'))}
            maxTagCount={maxTagCount}
            tagRender={(tag) =>
              tag.isMaxTag ? (
                <Tag>
                  <Tooltip
                    title={keys
                      .slice(2)
                      .map((key) => '/' + key.join('/'))
                      .join(', ')}
                  >
                    {keys.length - 2} more ...
                  </Tooltip>
                </Tag>
              ) : (
                <Tag>
                  <SearchHighLight text={tag.value} keyword={searchParams.keyOfValue} />
                </Tag>
              )
            }
            labelRender={(tag) => (
              <SearchHighLight text={tag.value as string} keyword={searchParams.keyOfValue} />
            )}
            maxTagPlaceholder={(omittedValues) => (
              <Tooltip title={omittedValues.map(({ label }) => label).join(', ')}>
                <span>{omittedValues.length} more...</span>
              </Tooltip>
            )}
            css={css`
              pointer-events: none; // readonly mode
              .ant-select-selection-overflow-item-rest {
                pointer-events: all; // enable tooltip hover event
              }
              .ant-select-selection-overflow-item-suffix {
                display: none;
              }
            `}
          />
        );
      },
    },
  ];

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
            {/*<Button*/}
            {/*  type='text'*/}
            {/*  icon={<PlusOutlined />}*/}
            {/*  onClick={() => addConfigModalRef.current?.open()}*/}
            {/*>*/}
            {/*  {t('common:add')}*/}
            {/*</Button>*/}
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

  function handleSearch(search: Record<string, string | undefined>) {
    if (pagination.current !== 1) {
      setPagination({ current: 1, pageSize: pagination.pageSize });
    }

    setSearchParams({
      keyOfOperationName: search.operationName,
      keyOfDependencyName: search.dependencyName,
      keyOfValue: search.keys,
      keyOfListPath: search.listPath,
    });
  }

  function handleDelete() {
    selectedRows.length &&
      deleteSortNode({
        id: selectedRows[0].id,
      });
  }

  const handleAddListSort: AddConfigModalProps<ListSortPrivate>['onSubmit'] = (form) =>
    form.validateFields().then((res) => {
      const { dependency, listPath, keys, ...rest } = res;
      const params = {
        ...rest,
        ...parseDependency(dependency),
        listPath: listPath.split('/').filter(Boolean),
        keys: keys.map((key) => key.split('/').filter(Boolean)),
      } as SortNodeBase;
      insertSortNode(params);
    });

  return (
    <div>
      <ConfigInfoTable<ListSortInfo>
        rowKey='id'
        requestSearch
        loading={loading}
        columns={columns}
        dataSource={data?.listSorts}
        footer={TableFooter}
        rowSelection={
          tableMode !== CONFIG_INFO_TABLE_MODE.DISPLAY
            ? {
                type: 'radio',
                onSelect: (record, selected, selectedRows) => {
                  setSelectedRows(selectedRows.filter(Boolean));
                },
              }
            : undefined
        }
        onSearch={handleSearch}
      />

      {/*<AddConfigModal<ListSortPrivate>*/}
      {/*  ref={addConfigModalRef}*/}
      {/*  operationList={props.operationList}*/}
      {/*  appId={props.appId}*/}
      {/*  title={t('components:appSetting.addListSort')}*/}
      {/*  rules={{*/}
      {/*    operationId: [{ required: true }],*/}
      {/*  }}*/}
      {/*  field={({ appId, operationId, dependency }) => (*/}
      {/*    <SortPathKeyInput appId={appId} operationId={operationId} dependency={dependency} />*/}
      {/*  )}*/}
      {/*  onSubmit={handleAddListSort}*/}
      {/*/>*/}
    </div>
  );
}
