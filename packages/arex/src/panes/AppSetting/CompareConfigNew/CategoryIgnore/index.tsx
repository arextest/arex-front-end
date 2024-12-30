import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Pagination, Popconfirm, Typography } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';

import { CompareConfigNewProps } from '@/panes/AppSetting/CompareConfigNew';
import AddConfigModal, {
  AddConfigModalProps,
  AddConfigModalRef,
} from '@/panes/AppSetting/CompareConfigNew/AddConfigModal';
import DependencyInput from '@/panes/AppSetting/CompareConfigNew/CategoryIgnore/DependencyInput';
import ConfigInfoTable, {
  CONFIG_INFO_TABLE_MODE,
  ConfigColumnsType,
} from '@/panes/AppSetting/CompareConfigNew/ConfigInfoTable';
import { IgnoreCategoryInfo } from '@/panes/AppSetting/CompareConfigNew/type';
import { ComparisonService } from '@/services';
import { IgnoreCategory, QueryIgnoreCategorySearchParams } from '@/services/ComparisonService';

export type CategoryIgnoreProps = CompareConfigNewProps &
  Pick<AddConfigModalProps<IgnoreCategory>, 'operationList'>;

const PAGE_SIZE = {
  SIZE_10: 10,
  SIZE_20: 20,
  SIZE_30: 30,
};

const pageSizeOptions = Object.values(PAGE_SIZE);

const CategoryIgnore: FC<CategoryIgnoreProps> = (props) => {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const [tableMode, setTableMode] = useState<CONFIG_INFO_TABLE_MODE>(
    CONFIG_INFO_TABLE_MODE.DISPLAY,
  );

  const [selectedRows, setSelectedRows] = useState<IgnoreCategoryInfo[]>([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE.SIZE_10,
  });

  const [searchParams, setSearchParams] = useState<QueryIgnoreCategorySearchParams>({});

  useEffect(() => {
    handleSearch({
      operationName: props.operation?.operationName,
      dependencyName: props.dependency?.operationName,
    });
  }, [props.operation, props.dependency, props.operationList]);

  const addConfigModalRef = useRef<AddConfigModalRef>(null);

  const {
    data = { totalCount: 0, ignoreCategories: [] },
    loading,
    run: queryIgnoreCategory,
  } = useRequest(
    () =>
      ComparisonService.queryAggregateIgnoreCategory({
        appId: props.appId,
        pageSize: pagination.pageSize,
        pageIndex: pagination.current,
        ...searchParams,
      }),
    {
      refreshDeps: [pagination, searchParams],
    },
  );

  const { run: insertIgnoreCategory } = useRequest(ComparisonService.insertIgnoreCategory, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.updateSuccess'));
        queryIgnoreCategory();
      } else message.error(t('message.updateFailed'));
    },
  });

  const { run: deleteIgnoreCategory } = useRequest(ComparisonService.deleteIgnoreCategory, {
    manual: true,
    onSuccess(success) {
      if (success) {
        message.success(t('message.delSuccess'));
        setTableMode(CONFIG_INFO_TABLE_MODE.DISPLAY);
        queryIgnoreCategory();
      } else message.error(t('message.delFailed'));
    },
  });

  const columns: ConfigColumnsType<IgnoreCategoryInfo> = [
    {
      title: t('appSetting.categoryType', { ns: 'components' }),
      dataIndex: ['ignoreCategoryDetail', 'operationType'],
      search: true,
    },
    {
      title: t('appSetting.operationName', { ns: 'components' }),
      dataIndex: ['ignoreCategoryDetail', 'operationName'],
      search: true,
      renderFallback: <Typography.Text type='secondary'>-</Typography.Text>,
    },
  ];

  function handleSearch(search: Record<string, any>) {
    if (pagination.current !== 1) {
      setPagination({ current: 1, pageSize: pagination.pageSize });
    }

    setSearchParams({
      keyOfOperationName: search.operationName,
      keyOfIgnoreOperationType: search.ignoreCategoryDetail?.operationType,
      keyOfIgnoreOperationName: search.ignoreCategoryDetail?.operationName,
    });
  }

  const handleDelete = () => {
    const id = selectedRows[0]?.id;
    if (id) {
      deleteIgnoreCategory({ id });
    } else message.error(t('message.selectRowWarning'));
  };

  const handleSubmit: AddConfigModalProps<IgnoreCategory>['onSubmit'] = (form) =>
    form.validateFields().then((params) => {
      const { appId, operationId, operationType, operationName } = params;
      insertIgnoreCategory({
        appId,
        operationId,
        ignoreCategoryDetail: {
          operationType,
          operationName,
        },
      });
    });
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

  return (
    <div>
      <ConfigInfoTable<IgnoreCategoryInfo>
        rowKey='id'
        requestSearch
        loading={loading}
        columns={columns}
        builtInColumns={{
          dependencyName: {
            hidden: true,
          },
        }}
        dataSource={data.ignoreCategories}
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

      <AddConfigModal<IgnoreCategory>
        ref={addConfigModalRef}
        appId={props.appId}
        operationList={props.operationList}
        title={t('components:appSetting.addCategoryIgnore')}
        builtInItems={{
          dependency: false,
        }}
        field={(fieldProps) => (
          <DependencyInput {...fieldProps} operationList={props.operationList} />
        )}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoryIgnore;
