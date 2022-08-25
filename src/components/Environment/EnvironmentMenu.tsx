import {
  MenuOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  DashOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { css } from '@emotion/react';
import { useRequest } from 'ahooks';
import { Button, Input, Tooltip, Dropdown, Menu, Modal } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import EnvironmentService from '../../services/Environment.service';
import { useStore } from '../../store';

export type EnvironmentProps = {
  value?: string;
  onSelect: (key: string, node: {}) => void;
};

type EnvironmentKeyValues = { key: string; value: string; active: boolean };
type EnvironmentType = {
  envName: string;
  id: string;
  keyValues: EnvironmentKeyValues[];
  workspaceId: string;
};

const MenuList = styled(Menu, { shouldForwardProp: (propName) => propName !== 'small' })<{
  small?: boolean;
}>`
  border: none !important;
  background: transparent !important;
  .ant-menu-item {
    margin: 4px 0 !important;
    height: ${(props) => (props.small ? '24px' : '28px')};
    line-height: ${(props) => (props.small ? '24px' : '28px')};
    border-radius: 2px;
    background: transparent !important;
    padding: 0;
  }
  .ant-menu-item-active {
    color: inherit !important;
    background-color: ${(props) => props.theme.color.active} !important;
  }
  .ant-menu-item-selected {
    background-color: ${(props) => props.theme.color.selected} !important;
  }
  .ant-menu-item-active.ant-menu-item-selected {
    color: ${(props) => props.theme.color.primary} !important;
  }
  .btnSelected {
    padding: 2px 0;
    &:hover {
      background-color: ${(props) => props.theme.color.selected} !important;
    }
  }
  .btnHover {
    padding: 2px 0;
    &:hover {
      background-color: #eee;
    }
  }
`;

const ItemLabel = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 18px;
  & > span:first-of-type {
    width: calc(100% - 56px);
    overflow: hidden; //超出的文本隐藏
    text-overflow: ellipsis; //溢出用省略号显示
    white-space: nowrap; //溢出不换行
  }
`;

const Environment: FC<EnvironmentProps> = ({ value, onSelect }) => {
  const params = useParams();
  const [iconIsShow, setIconIsShow] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeEnvironmentItem, setActiveEnvironmentItem] = useState({});
  const [renameValue, setRenameValue] = useState('');
  const [renameKey, setRenameKey] = useState('');
  const [searchEnvironmentData, setSearchEnvironmentData] = useState([]);
  const selectedKeys = useMemo(() => (value ? [value] : []), [value]);
  const {
    environmentTreeData,
    setEnvironmentTreeData,
    currentEnvironment,
    setCurrentEnvironment,
    activeEnvironment,
    setActiveEnvironment,
  } = useStore();

  const handleSelect = (rowData: any) => {
    const info: any = environmentTreeData.find((e) => e.id == rowData.key);
    onSelect &&
      onSelect(info.id as string, {
        title: info.envName,
        key: info.id,
        pageType: 'environment',
        qid: info.id,
        isNew: true,
        keyValues: info.keyValues,
      });
  };

  const { run: fetchEnvironmentData } = useRequest(
    () => EnvironmentService.getEnvironment({ workspaceId: params.workspaceId as string }),
    {
      ready: !!params.workspaceId,
      refreshDeps: [params.workspaceId],
      onSuccess(res) {
        setSearchEnvironmentData(res);
        setEnvironmentTreeData(res);
      },
    },
  );

  const environmentItemOperation = (e: string, data: EnvironmentType) => {
    setActiveEnvironmentItem(data);
    if (e == 'delete') {
      setIsModalVisible(true);
    } else if (e == 'rename') {
      setRenameValue(data.envName);
      setRenameKey(data.id);
    }
  };

  const handleOk = (e: string) => {
    if (e == 'delete') {
      EnvironmentService.deleteEnvironment(activeEnvironmentItem.id).then((res) => {
        if (res.body.success == true) {
          fetchEnvironmentData();
          setIsModalVisible(false);
        } else {
          console.log('deleteError');
        }
      });
    }
  };

  //修改envName
  const rename = () => {
    if (activeEnvironmentItem.envName == renameValue) {
      setRenameValue('');
      setRenameKey('');
      return;
    }
    const env: any = { ...activeEnvironmentItem, envName: renameValue };
    EnvironmentService.saveEnvironment({ env: env }).then((res) => {
      if (res.body.success == true) {
        if (activeEnvironment && activeEnvironment.id == env.id) {
          setActiveEnvironment(env);
        }
        setRenameValue('');
        setRenameKey('');
        fetchEnvironmentData();
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //搜索
  const searchEnvironment = (val: string) => {
    const searchData = environmentTreeData.filter((data: any) => data.envName.includes(val));
    setSearchEnvironmentData(searchData);
  };

  const menu = (data: EnvironmentType) => {
    return (
      <Menu
        onClick={(e) => {
          e.domEvent.stopPropagation();
          // setVisible(false);
        }}
        items={[
          {
            key: '1',
            label: (
              <a target='_blank' onClick={() => {}}>
                share
              </a>
            ),
            disabled: true,
          },
          {
            key: '2',
            label: (
              <a target='_blank' onClick={() => {}}>
                Move
              </a>
            ),
            disabled: true,
          },
          {
            key: '3',
            label: (
              <a target='_blank' onClick={() => {}}>
                Duplicate
              </a>
            ),
            disabled: true,
          },
          {
            key: '4',
            label: <a onClick={() => environmentItemOperation('rename', data)}>Rename</a>,
          },
          {
            key: '5',
            label: (
              <a style={{ color: 'red' }} onClick={() => environmentItemOperation('delete', data)}>
                Delete
              </a>
            ),
          },
        ]}
      />
    );
  };

  const items = searchEnvironmentData.map((data: EnvironmentType) => {
    return {
      label: (
        <ItemLabel
          onMouseEnter={() => {
            setIconIsShow(data.id);
          }}
          onMouseLeave={() => {
            setIconIsShow('');
          }}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              e.stopPropagation();
            }
          }}
        >
          {renameKey === data.id ? (
            <span>
              <Input
                autoFocus
                style={{ padding: '0 4px', width: '100%' }}
                value={renameValue}
                onBlur={rename}
                onPressEnter={rename}
                onChange={(val) => setRenameValue(val.target.value)}
              />
            </span>
          ) : (
            <span>{data.envName}</span>
          )}
          <span onClick={(event) => event.stopPropagation()}>
            {currentEnvironment && currentEnvironment.id == data.id ? (
              data.id == iconIsShow ? (
                <CheckCircleFilled
                  onClick={() => {
                    data.id == currentEnvironment.id
                      ? setCurrentEnvironment('0')
                      : setCurrentEnvironment(data.id);
                  }}
                />
              ) : (
                <>
                  <CheckCircleFilled onClick={() => setCurrentEnvironment(data.id)} />
                  <span
                    css={css`
                      display: inline-block;
                      width: 14px;
                    `}
                  ></span>
                </>
              )
            ) : data.id == iconIsShow ? (
              <CheckCircleOutlined
                className={
                  activeEnvironment && activeEnvironment.id == iconIsShow
                    ? 'btnSelected'
                    : 'btnHover'
                }
                onClick={() => setCurrentEnvironment(data.id)}
              />
            ) : null}
            {data.id == iconIsShow ? (
              <Dropdown overlay={menu(data)} trigger={['click']}>
                <DashOutlined
                  className={
                    activeEnvironment && activeEnvironment.id == iconIsShow
                      ? 'btnSelected'
                      : 'btnHover'
                  }
                />
              </Dropdown>
            ) : null}
          </span>
        </ItemLabel>
      ),
      key: data.id,
    };
  });

  return (
    <div>
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          margin-bottom: 10px;
        `}
      >
        <Tooltip placement='bottomLeft' title={'Create New'} mouseEnterDelay={0.5}>
          <Button
            css={css`
              margin-right: 5px;
            `}
            icon={<PlusOutlined />}
            type='text'
            size='small'
            onClick={() => {
              const CreateEnvironment = {
                env: { envName: 'New Environment', workspaceId: params.workspaceId, keyValues: [] },
              };
              EnvironmentService.saveEnvironment(CreateEnvironment).then((res) => {
                if (res.body.success == true) {
                  fetchEnvironmentData();
                }
              });
            }}
          />
        </Tooltip>
        <Input
          className={'environment-header-search'}
          size='small'
          placeholder=''
          onChange={(val) => searchEnvironment(val.target.value)}
          prefix={<MenuOutlined />}
        />
      </div>
      <MenuList items={items} selectedKeys={selectedKeys} onClick={handleSelect} />
      <Modal
        title={`Delete "${activeEnvironmentItem.envName}"`}
        okText='Delete'
        visible={isModalVisible}
        onOk={() => handleOk('delete')}
        onCancel={handleCancel}
      >
        <p>
          Deleting this environment might cause any monitors or mock servers using it to stop
          functioning properly. Are you sure you want to continue?
        </p>
      </Modal>
    </div>
  );
};
export default Environment;
