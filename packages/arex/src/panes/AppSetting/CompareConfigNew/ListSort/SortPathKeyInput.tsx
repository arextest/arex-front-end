import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Form, Input, Select } from 'antd';
import React from 'react';

import { ReportService } from '@/services';
import { DependencyParams } from '@/services/ComparisonService';

export type SortPathKeyInputProps = {
  appId: string;
  operationId?: string;
  dependency?: DependencyParams;
};

export default function SortPathKeyInput(props: SortPathKeyInputProps) {
  const { appId, operationId, dependency } = props;
  const { t } = useTranslation();

  // const {
  //   data: contract,
  //   mutate: setContract,
  //   loading: loadingContract,
  // } = useRequest(
  //   () =>
  //     ReportService.queryContract({
  //       appId,
  //       operationId,
  //       ...dependency,
  //     }),
  //   {
  //     ready: !!appId, // TODO && collapseExpand
  //     refreshDeps: [appId, operationId, dependency],
  //     onBefore() {
  //       setContract();
  //     },
  //   },
  // );

  return (
    <>
      <Form.Item
        name='listPath'
        label={t('components:appSetting.path')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        {/* TODO select path from contract tree */}
        <Input placeholder={t('components:appSetting.inputListSortPath')} />
      </Form.Item>

      <Form.Item
        name='keys'
        label={t('components:appSetting.keys')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        {/* TODO select path from contract tree */}
        <Select
          allowClear
          mode='tags'
          open={false}
          placeholder={t('components:appSetting.inputListSortKeys')}
        />
      </Form.Item>
    </>
  );
}
