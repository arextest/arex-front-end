import { Menu, Tag } from 'antd';
import React, { FC, ReactNode, useEffect, useMemo } from 'react';

import { SceneInfo, SubScene } from '../../../services/Replay.type';
import { SceneCodeMap } from '.';

export interface SceneMenuProps {
  data: SceneInfo[];
  onClick?: (subScenes: SubScene[]) => void;
}
const SceneMenu: FC<SceneMenuProps> = (props) => {
  useEffect(() => {
    props.data.length && props.onClick?.(props.data[0].subScenes);
  }, [props.data]);

  const items = useMemo(
    () =>
      props.data.map((scene, index) => {
        const firstSubScene = scene.subScenes[0];
        const fullPath = firstSubScene.details.reduce<ReactNode[]>((path, item, i) => {
          const title = (
            <>
              {item.categoryName}{' '}
              <Tag color={SceneCodeMap[item.code.toString()].color}>
                {SceneCodeMap[item.code.toString()].message}
              </Tag>
            </>
          );

          i && path.push('+ ');
          path.push(title);
          return path;
        }, []);

        return { label: fullPath, key: index };
      }),
    [props.data],
  );
  return (
    <Menu
      defaultSelectedKeys={['0']}
      items={items}
      onClick={({ key }) => {
        props.onClick?.(props.data[parseInt(key)].subScenes);
      }}
    />
  );
};

export default SceneMenu;
