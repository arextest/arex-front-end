import { DownOutlined } from '@ant-design/icons';
import {
  css,
  styled,
  TooltipButton,
  tryParseJsonString,
  useTranslation,
} from '@arextest/arex-core';
import { useRequest } from 'ahooks';
import { Collapse, Input, InputProps, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { ReportService } from '@/services';
import { DependencyParams } from '@/services/ComparisonService';

import IgnoreTree from './IgnoreTree';

const IgnoreTreeWrapper = styled.div<{ lineThrough?: boolean }>`
  .ant-tree-node-selected {
    text-decoration: ${(props) => (props.lineThrough ? 'line-through' : 'none')};
  }
`;

export type ExclusionPathInputProps = Omit<InputProps, 'onChange'> & {
  contract?: Record<string, any>;
  onChange?: (value: string) => void;
  loadingContract?: boolean;
};

const IgnorePathInput = (props: ExclusionPathInputProps) => {
  const { contract, loadingContract, ...inputProps } = props;
  const { t } = useTranslation();

  const [expand, setExpand] = useState(false);

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();

  return (
    <IgnoreTreeWrapper lineThrough>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          {...inputProps}
          placeholder={t('components:appSetting.inputIgnorePath')}
          onChange={(e) => {
            props.onChange?.(e.target.value);
          }}
        />
        <TooltipButton
          type='default'
          size='middle'
          title={t('components:appSetting.selectNodePath')}
          icon={<DownOutlined style={{ width: '10px' }} />}
          textProps={{ style: { height: '10px' } }}
          onClick={() => setExpand(!expand)}
        />
      </Space.Compact>

      <Collapse
        ghost
        activeKey={expand ? 'nodeTree' : undefined}
        css={css`
          .ant-collapse-header {
            display: none !important;
          }
          .ant-collapse-content-box {
            padding: 16px 0 0 !important;
          }
        `}
        items={[
          {
            key: 'nodeTree',
            showArrow: false,
            children: (
              <IgnoreTree
                multiple={false}
                loading={props.loadingContract}
                selectedKeys={selectedKeys}
                onSelect={(keys) => {
                  setSelectedKeys(keys);
                  props.onChange?.(keys.join('/'));
                }}
                treeData={contract}
              />
            ),
          },
        ]}
      />
    </IgnoreTreeWrapper>
  );
};

export default IgnorePathInput;
