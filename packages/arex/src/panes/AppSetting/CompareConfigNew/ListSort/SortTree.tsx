import { css, EmptyWrapper, useTranslation } from '@arextest/arex-core';
import { Card, Tree } from 'antd';
import { TreeProps } from 'antd/es';
import React, { FC, useMemo } from 'react';

import { getSortNodes } from './utils';

type SortTreeProps = Omit<TreeProps, 'treeData'> & {
  treeData?: any[];
  title?: string;
};

const SortTree: FC<SortTreeProps> = (props) => {
  const { t } = useTranslation('components');

  const treeData = useMemo(() => getSortNodes(props.treeData, ''), [props.treeData]);
  return (
    <Card size='small' title={t('appSetting.chooseOnekey')}>
      <EmptyWrapper
        loading={false}
        description={t('appSetting.emptyContractTip')}
        empty={!treeData?.length}
      >
        <Tree
          height={800}
          {...props}
          checkable
          checkStrictly
          defaultExpandAll
          autoExpandParent
          selectedKeys={[]}
          treeData={treeData}
          css={css`
            max-height: calc(100vh - 300px);
            overflow-y: auto;
          `}
        />
      </EmptyWrapper>
    </Card>
  );
};

export default SortTree;
