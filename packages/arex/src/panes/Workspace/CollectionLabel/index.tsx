import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { App, Button, Popconfirm, Space, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { FC, useRef } from 'react';
import { Label } from 'src/services/ReportService/label';

import { ReportService } from '@/services';
import { useWorkspaces } from '@/store';

import LabelEditor, { LabelEditorProps, LabelEditorRef } from './LabelEditor';

const CollectionLabel: FC = () => {
  const { message } = App.useApp();
  const { t } = useTranslation(['common', 'components']);

  const { activeWorkspaceId } = useWorkspaces();
  const createAndUpdateRef = useRef<LabelEditorRef>(null);

  const columns: ColumnsType<Label> = [
    {
      title: t('workSpace.labelName', { ns: 'components' }),
      dataIndex: 'labelName',
      key: 'labelName',
      render(labelName, record) {
        return <Tag color={record.color}>{labelName}</Tag>;
      },
    },
    {
      title: t('action'),
      width: 120,
      align: 'right',
      render(_, record) {
        return (
          <Space size='middle'>
            <Button size='small' onClick={() => createAndUpdateRef.current?.showModal(record)}>
              {t('edit')}
            </Button>

            <Popconfirm
              title={t('workSpace.delLabelConfirmText', { ns: 'components' })}
              onConfirm={() => {
                labelRemoveRun({
                  workspaceId: activeWorkspaceId as string,
                  id: record.id,
                });
              }}
              okText={t('yes')}
              cancelText={t('no')}
            >
              <Button danger size='small'>
                {t('delete')}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const { data: labelData, run: queryLabels } = useRequest(
    () => ReportService.queryLabels({ workspaceId: activeWorkspaceId as string }),
    { ready: !!activeWorkspaceId },
  );

  const { run: labelRemoveRun } = useRequest(ReportService.removeLabels, {
    manual: true,
    ready: !!activeWorkspaceId,
    onSuccess() {
      queryLabels();
    },
    onError() {
      message.error(t('delError'));
    },
  });

  const { run: labelSaveRun } = useRequest(ReportService.saveLabels, {
    manual: true,
    ready: !!activeWorkspaceId,
    onSuccess() {
      message.success(t('updateSuccess'));
      queryLabels();
    },
    onError() {
      message.error(t('updateError'));
    },
  });

  const handleSave: LabelEditorProps['onSave'] = ({ id, labelName, color }) =>
    labelSaveRun({
      id,
      color,
      labelName,
      workspaceId: activeWorkspaceId as string,
    });

  return (
    <>
      <LabelEditor hiddenButton ref={createAndUpdateRef} onSave={handleSave} />
      <Table
        size='small'
        rowKey='id'
        pagination={false}
        dataSource={labelData}
        columns={columns}
        footer={() => (
          <Button
            block
            size='small'
            type='text'
            icon={<PlusOutlined />}
            onClick={() => createAndUpdateRef.current?.showModal()}
          >
            {t('workSpace.addLabelButton', { ns: 'components' })}
          </Button>
        )}
      />
    </>
  );
};

export default CollectionLabel;
