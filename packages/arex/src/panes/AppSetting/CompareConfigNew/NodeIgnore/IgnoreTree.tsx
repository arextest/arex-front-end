import { EmptyWrapper, styled, useTranslation } from '@arextest/arex-core';
import { Card, Tree } from 'antd';
import { TreeProps } from 'antd/es';
import React, { FC, useMemo } from 'react';

import { getIgnoreNodes } from './utils';

type IgnoreTreeProps = Omit<TreeProps, 'treeData'> & {
  title?: React.ReactNode;
  loading?: boolean;
  treeData?: Record<string, any>;
  lineThrough?: boolean;
};

const IgnoreTreeWrapper = styled.div<{ lineThrough?: boolean }>`
  .ant-tree-node-selected {
    text-decoration: ${(props) => (props.lineThrough ? 'line-through' : 'none')};
  }
`;

const IgnoreTree: FC<IgnoreTreeProps> = (props) => {
  const { t } = useTranslation(['components', 'common']);
  const treeData = useMemo(() => getIgnoreNodes(props.treeData, ''), [props.treeData]);

  return (
    <IgnoreTreeWrapper lineThrough={props.lineThrough}>
      <Card size='small' title={props.title}>
        <EmptyWrapper
          loading={props.loading}
          empty={!Object.keys(props.treeData || {}).length}
          description={t('appSetting.emptyContractTip')}
        >
          <Tree multiple defaultExpandAll height={800} {...props} treeData={treeData} />
        </EmptyWrapper>
      </Card>
    </IgnoreTreeWrapper>
  );
};

export default IgnoreTree;
