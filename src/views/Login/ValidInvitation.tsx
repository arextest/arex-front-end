import {
  CheckCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useTheme } from '@emotion/react';
import { useRequest } from 'ahooks';
import { Card, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FlexCenterWrapper } from '../../components/styledComponents';
import { AccessTokenKey, RefreshTokenKey } from '../../constant';
import { setLocalStorage, tryParseJsonString } from '../../helpers/utils';
import WorkspaceService from '../../services/Workspace.service';

enum Status {
  loading,
  success,
  failed,
  invalidLink,
}

type InvitationData = {
  token: string;
  mail: string;
  workSpaceId: string;
};

const ValidInvitation = () => {
  const { color } = useTheme();
  const nav = useNavigate();

  const [status, setStatus] = useState<Status>(Status.loading);
  const [searchParams] = useSearchParams();

  const { run: validInvitation } = useRequest(WorkspaceService.validInvitation, {
    manual: true,
    onSuccess(res, params) {
      if (res.body.success) {
        setLocalStorage('email', params[0].userName);
        setLocalStorage(AccessTokenKey, res.body.accessToken);
        setLocalStorage(RefreshTokenKey, res.body.refreshToken);

        setStatus(Status.success);
      } else {
        setStatus(Status.failed);
      }
    },
    onFinally() {
      setTimeout(() => {
        nav('/');
      }, 1000);
    },
  });

  function decodeInvitation<T>(base64: string) {
    try {
      return tryParseJsonString<InvitationData>(atob(base64));
    } catch (e) {
      setStatus(Status.invalidLink);
      setTimeout(() => {
        nav('/');
      }, 1000);
    }
  }

  useEffect(() => {
    const decodeData = decodeInvitation(searchParams.getAll('upn')[0]);
    if (decodeData?.token) {
      validInvitation({
        token: decodeData.token,
        userName: decodeData.mail,
        workspaceId: decodeData.workSpaceId,
      });
    }
  }, []);

  return (
    <FlexCenterWrapper>
      <Card>
        {status === Status.loading ? (
          <Space>
            <LoadingOutlined />
            <span>Verifying ...</span>
          </Space>
        ) : status === Status.success ? (
          <Space>
            <CheckCircleOutlined style={{ color: color.success }} />{' '}
            <span>Authentication success! Redirecting...</span>
          </Space>
        ) : status === Status.failed ? (
          <Space>
            <StopOutlined style={{ color: color.error }} />
            <span>Authentication failed! Redirecting...</span>
          </Space>
        ) : (
          <Space>
            <WarningOutlined style={{ color: color.warning }} />
            <span>Invalid Invitation Link! Redirecting...</span>
          </Space>
        )}
      </Card>
    </FlexCenterWrapper>
  );
};

export default ValidInvitation;
