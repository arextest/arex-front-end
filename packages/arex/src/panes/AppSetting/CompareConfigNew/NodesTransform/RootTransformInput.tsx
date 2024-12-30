import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Select } from 'antd';
import React, { FC, useMemo } from 'react';

import { ComparisonService } from '@/services';

export type RootTransformInputProps = {
  appId: string;
  value?: string;
  onChange?: (method: string) => void;
};

const RootTransformInput: FC<RootTransformInputProps> = (props) => {
  const { appId, ...selectProps } = props;
  const { t } = useTranslation();

  const { data: methods = [] } = useRequest(ComparisonService.getTransformMethod, {
    ready: !!appId,
    defaultParams: [appId],
  });

  const methodsOptions = useMemo(
    () =>
      methods.map((method) => ({
        value: method,
        label: method,
      })),
    [methods],
  );

  return (
    <Select
      options={methodsOptions}
      placeholder={t('components:appSetting.addTransformNode')}
      {...selectProps}
    />
  );
};

export default RootTransformInput;
