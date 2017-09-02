import React from 'react';

import { Group, Icon, svgPathToMesh } from 'components/Renderer';

/* eslint-disable react/no-unused-prop-types */
export type EntityData = {
  type: string;
  x: number;
  y: number;
  z: number;
  data: Object;
  id: string,
};
/* eslint-enable */

const entityTypes = {
  warp: {
    color: 0x800097,
    mesh: svgPathToMesh('M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z'),
  },
  object: {
    color: 0x44242,
    mesh: svgPathToMesh('M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15Z'),
  },
  trigger: {
    color: 0xf45042,
    mesh: svgPathToMesh('M11,4.5H13V15.5H11V4.5M13,17.5V19.5H11V17.5H13Z'),
  },
  interactable: {
    color: 0x4286f4,
    mesh: svgPathToMesh('M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z'),
  },
  unknown: {
    color: 0x0,
    mesh: svgPathToMesh('M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z'),
  },
};

export default class Entity extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    entity: EntityData;
  };

  render() {
    const { entity } = this.props;
    const { mesh, color } = entityTypes[entity.type] || entityTypes.unknown;

    return (
      <Group>
        <Icon
          x={entity.x * 16}
          y={entity.y * 16}
          width={16}
          height={16}
          color={color}
          mesh={mesh}
        />
      </Group>
    );
  }
}
