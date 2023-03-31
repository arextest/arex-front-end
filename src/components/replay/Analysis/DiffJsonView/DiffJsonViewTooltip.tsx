import { css, useTheme } from '@emotion/react';
import { Typography } from 'antd';
import { TextProps } from 'antd/es/typography/Text';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import useUserProfile from '../../../../store/useUserProfile';

const DiffJsonViewTooltip: FC<TextProps> = (props) => {
  const { t } = useTranslation(['components']);
  const emotionTheme = useTheme();
  const { theme } = useUserProfile();

  return (
    <div
      css={css`
        display: flex;
        justify-content: space-between;
        .color-tag-pink {
          background-color: ${emotionTheme.colorInfoBgHover};
        }
        .color-tag-green {
          background-color: ${emotionTheme.colorWarningBgHover};
        }
      `}
    >
      <div
        className={`MsgWithDiffLegend`}
        css={css`
          color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#333'};
        `}
      >
        <div>
          <div className='color-tag-green' />
          <Typography.Text type='secondary' {...props}>
            {t('replay.moreNode')}
          </Typography.Text>
        </div>
        <div>
          <div className='color-tag-pink' />
          <Typography.Text type='secondary' {...props}>
            {t('replay.differenceNode')}
          </Typography.Text>
        </div>
        <div>
          <div className='color-tag-grey' />
          <Typography.Text type='secondary' {...props}>
            {t('replay.ignoreNode')}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default DiffJsonViewTooltip;
