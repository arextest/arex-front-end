import { SpaceBetweenWrapper } from '@arextest/arex-core';
import { Card, Checkbox, List, Typography } from 'antd';
import React, { FC, useMemo } from 'react';

import { Connector } from '@/constant';
import { InterfaceNoiseItem, RandomNoise } from '@/services/ScheduleService';

export interface CompareNoiseOperationItemProps {
  appId: string;
  value?: RandomNoise[];
  noise: InterfaceNoiseItem;
  onChange?: (value: string[]) => void;
}

const CompareNoiseOperationItem: FC<CompareNoiseOperationItemProps> = (props) => {
  const value = useMemo(
    () =>
      props.value?.reduce<string[]>((value, cur, index) => {
        value.push(
          ...cur.noiseItemList.map((item) => {
            const entityPath = item.nodeEntity.map((entityItem) => entityItem.nodeName).join('/');
            return entityPath + Connector + index;
          }),
        );
        return value;
      }, []),
    [props.value],
  );

  return (
    <Card key={props.noise.operationId} bodyStyle={{ padding: '8px' }}>
      <Checkbox.Group
        value={value}
        onChange={(value) => props.onChange?.(value as string[])}
        style={{ width: '100%' }}
      >
        <List
          size='small'
          style={{ width: '100%' }}
          dataSource={props.noise.randomNoise}
          renderItem={(operation, randomNoiseIndex) => {
            return (
              <List.Item style={{ display: 'block' }}>
                <SpaceBetweenWrapper>
                  <span>
                    {operation.mockCategoryType.entryPoint && (
                      <Typography.Text type='secondary'>[EntryPoint]</Typography.Text>
                    )}{' '}
                    {operation.operationName}
                  </span>
                </SpaceBetweenWrapper>
                <List
                  size='small'
                  dataSource={operation.noiseItemList}
                  renderItem={(item) => {
                    const entityPath = item.nodeEntity
                      .map((entityItem) => entityItem.nodeName)
                      .join('/');
                    return (
                      <List.Item style={{ paddingRight: 0 }}>
                        <SpaceBetweenWrapper style={{ width: '100%' }}>
                          <span>{entityPath}</span>
                          <Checkbox
                            className={`denoise-checkbox-${props.appId}`}
                            value={entityPath + Connector + randomNoiseIndex}
                          />
                        </SpaceBetweenWrapper>
                      </List.Item>
                    );
                  }}
                />
              </List.Item>
            );
          }}
        />
      </Checkbox.Group>
    </Card>
  );
};

export default CompareNoiseOperationItem;
