import { useTranslation } from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Form, Select, SelectProps } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { AddConfigModalFieldProps } from '@/panes/AppSetting/CompareConfigNew/AddConfigModal';
import { ComparisonService } from '@/services';
import { OperationInterface } from '@/services/ApplicationService';
import { IgnoreCategory } from '@/services/ComparisonService';

const DependencyInput: FC<
  AddConfigModalFieldProps<IgnoreCategory> & {
    operationList?: OperationInterface<'Interface'>[];
  }
> = (props) => {
  const { t } = useTranslation();

  const operationTypeValue = Form.useWatch('operationTypeValue', props.form);

  useEffect(() => {
    props.form.setFieldValue('operationName', undefined);
  }, [operationTypeValue]);

  const [operationNameOptions, setOperationNameOptions] = useState<SelectProps['options']>([]);

  const [categoryTypeOptions, setCategoryOptions] = useState<SelectProps['options']>([]);
  useRequest(ComparisonService.queryCategoryType, {
    onSuccess(res) {
      const options = res
        .filter((item) => !item.entryPoint)
        .map((item) => ({
          label: item.name,
          value: item.name,
        }));
      setCategoryOptions(options);
    },
  });

  const optionsGroupMap = useMemo(
    () =>
      props.operationList?.reduce((group, item) => {
        if (!item.dependencyList) return group;

        item.dependencyList?.forEach((dependency) => {
          if (group.has(dependency.operationType)) {
            group.get(dependency.operationType)?.add(dependency.operationName);
          } else {
            group.set(dependency.operationType, new Set([dependency.operationName]));
          }
        });
        return group;
      }, new Map<string, Set<string>>()) || new Map<string, Set<string>>(),
    [props.operationList],
  );

  function handleOperationTypeChange(value: string) {
    setOperationNameOptions(
      props.operationId
        ? // GLOBAL: set all dependency
          Array.from(optionsGroupMap.get(value) || [])?.map((value) => ({
            label: value,
            value,
          }))
        : // INTERFACE: set dependency of current interface
          props.operationList
            ?.find((item) => item.id === props.operationId)
            ?.dependencyList?.filter((item) => item.operationType === value)
            .map((item) => ({
              label: item.operationName,
              value: item.operationName,
            })) || [],
    );
  }
  return (
    <>
      <Form.Item
        name='operationType'
        label={t('components:appSetting.dependency')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          options={categoryTypeOptions}
          onChange={handleOperationTypeChange}
          placeholder={t('components:appSetting.categoryTypePlaceholder')}
        />
      </Form.Item>

      <Form.Item name='operationName' label={t('components:appSetting.operationName')}>
        <Select
          allowClear
          options={operationNameOptions}
          placeholder={t('components:appSetting.operationNamePlaceholder')}
        />
      </Form.Item>
    </>
  );
};

export default DependencyInput;
