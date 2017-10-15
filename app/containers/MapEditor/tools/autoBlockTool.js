import React from 'react';
import EyeIcon from 'mdi-react/EyeIcon';
import createDrawingTool from './createDrawingTool';
import AutoBlockCreator from './AutoBlockCreator';

const autoBlock = {
  // Main blocks
  nw: 0x6b, // north-west
  n: 0x6c,  // north
  ne: 0x6d, // north-east
  w: 0x73,  // west
  c: 0x71,  // centre
  e: 0x75,  // east
  sw: 0x7b, // south-west
  s: 0x7c,  // south
  se: 0x7d, // south-east

  // Inside corners
  inw: 0xb2, // inside north-west
  ine: 0xb3, // inside north-east
  isw: 0xba, // inside south-west
  ise: 0xbb, // inside south-east

  // Other
  g: 0x71, // Ground

  // Configuration
  enableLayering: true,
};

const autoBlock2 = {
  // Main blocks
  nw: 0x122, // north-west
  n: 0x123,  // north
  ne: 0x124, // north-east
  w: 0x12a,  // west
  c: 0x12b,  // centre
  e: 0x12c,  // east
  sw: 0x132, // south-west
  s: 0x133,  // south
  se: 0x134, // south-east

  // Inside corners
  inw: 0x128, // inside north-west
  ine: 0x129, // inside north-east
  isw: 0x130, // inside south-west
  ise: 0x131, // inside south-east

  // Other
  g: 0x1, // Ground

  // Configuration
  enableLayering: false,
};


function drawRectangle(a, b, drawPoint) {
  const nwx = Math.min(a.x, b.x);
  const sex = Math.max(a.x, b.x);
  const nwy = Math.min(a.y, b.y);
  const sey = Math.max(a.y, b.y);

  const points = [];
  for (let y = nwy; y <= sey; y++) { // eslint-disable-line no-plusplus
    for (let x = nwx; x <= sex; x++) { // eslint-disable-line no-plusplus
      points.push(drawPoint(x, y, { x: nwx, y: nwy }, { x: sex, y: sey }));
    }
  }
  return points;
}

function invertAutoBlockConfiguration(config) {
  return {
    c: config.g,
    g: config.c,
    n: config.s,
    s: config.n,
    e: config.w,
    w: config.e,
    ne: config.ine,
    se: config.ise,
    nw: config.inw,
    sw: config.isw,
    ine: config.ne,
    ise: config.se,
    inw: config.nw,
    isw: config.sw,
  };
}

export function getRoleForPoint(x, y, nw, se) {
  const x0 = nw.x;
  const y0 = nw.y;
  const x1 = se.x;
  const y1 = se.y;

  if (x0 === x && y0 === y) {
    return 'nw';
  }

  if (x1 === x && y0 === y) {
    return 'ne';
  }

  if (x0 === x && y1 === y) {
    return 'sw';
  }

  if (x1 === x && y1 === y) {
    return 'se';
  }

  if (y0 === y) {
    return 'n';
  }

  if (y1 === y) {
    return 's';
  }

  if (x1 === x) {
    return 'e';
  }

  if (x0 === x) {
    return 'w';
  }

  return 'c';
}

export function getRoleForBlock(block, autoBlockConfig) {
  return Object.keys(autoBlockConfig).find((x) => autoBlockConfig[x] === block);
}

const roleBearings = {
  n: 0,
  ne: 45,
  e: 90,
  se: 135,
  s: 180,
  sw: 225,
  w: 270,
  nw: 315,
};

const roleComponents = {
  w: ['w'],
  n: ['n'],
  e: ['e'],
  s: ['s'],
  ne: ['n', 'e'],
  nw: ['n', 'w'],
  sw: ['s', 'w'],
  se: ['s', 'e'],
};

const oppositeRoles = {
  w: 'e',
  n: 's',
  e: 'w',
  s: 'n',
};

const roleTypes = {
  n: 'wall',
  s: 'wall',
  e: 'wall',
  w: 'wall',
  ne: 'corner',
  nw: 'corner',
  se: 'corner',
  sw: 'corner',
  ine: 'inner-corner',
  inw: 'inner-corner',
  ise: 'inner-corner',
  isw: 'inner-corner',
};

function checkRole(role) {
  return roleTypes[role] === 'wall' && (roleTypes[role] === 'corner' || roleTypes[role] === 'wall');
}

function angleBetweenRoles(a, b) {
  return Math.abs(roleBearings[a] - roleBearings[b]) % 180;
}

function hasTypes(role, types) {
  return types.some((type) => roleTypes[role] === type);
}

export function determineRoleInteraction(currentRole, suggestedRole) {
  if (currentRole === undefined || currentRole === suggestedRole) {
    return suggestedRole;
  }

  // Center
  if (currentRole === 'c' || suggestedRole === 'c' || suggestedRole === 'g' || currentRole === 'g') {
    // return 'c';
    return suggestedRole;
  }

  if (hasTypes(suggestedRole, ['wall']) && hasTypes(currentRole, ['wall', 'corner'])) {
    if (oppositeRoles[suggestedRole] === currentRole) {
      return 'c';
    }
  }

  if (hasTypes(currentRole, ['inner-corner']) && hasTypes(suggestedRole, ['wall', 'corner'])) {
    return 'c';
  }

  // A straight wall gets overlayed on another straight wall becoming the inner corner wall opposite it
  if (checkRole(currentRole) || checkRole(suggestedRole)) {
    const [maybeCornerRole, nonCornerRole] = roleTypes[suggestedRole] === 'corner'
          ? [suggestedRole, currentRole]
          : [currentRole, suggestedRole];

    const [verticalPart, horizontalPart] = roleComponents[maybeCornerRole];
    const [perpendicular, parallel] = angleBetweenRoles(verticalPart, nonCornerRole)
          ? [verticalPart, horizontalPart]
          : [horizontalPart, verticalPart];

    // If both walls are straight or if the parallel component of the corner role is opposite to the non-corner
    if (roleTypes[maybeCornerRole] === 'wall' || oppositeRoles[parallel] === nonCornerRole) {
      const pieces = [oppositeRoles[perpendicular], oppositeRoles[nonCornerRole]];

      // North/south come first
      if (pieces[0] === 'w' || pieces[0] === 'e') {
        pieces.reverse();
      }

      return `i${pieces.join('')}`;
    }

    if (suggestedRole === parallel || currentRole === parallel) {
      return parallel;
    }
  }

  if (roleTypes[suggestedRole] === 'corner' && roleTypes[currentRole] === 'corner') {
    const [suggestedVerticalPart, suggestedHorizontalPart] = roleComponents[suggestedRole];
    const [currentVerticalPart, currentHorizontalPart] = roleComponents[currentRole];

    if (suggestedVerticalPart === currentVerticalPart) {
      if (oppositeRoles[currentHorizontalPart] === suggestedHorizontalPart) {
        return currentVerticalPart;
      }
    } else if (suggestedHorizontalPart === currentHorizontalPart) {
      if (oppositeRoles[currentVerticalPart] === suggestedVerticalPart) {
        return currentHorizontalPart;
      }
    }
  }

  return 'g';
}

const MODIFY_AUTOBLOCK = 'jigglemap/MapEditor/tools/AutoBlock/MODIFY_AUTOBLOCK';

export default createDrawingTool({
  id: 'auto-block-tool',
  name: '',
  description: '',
  layers: ['map'],
  icon: <EyeIcon />,
  cursor: 'pointer',
  component: ({ tabDispatch, state }: { tabDispatch: Dispatch, state: { tool: Object } }) => ( // eslint-disable-line react/no-unused-prop-types
    <AutoBlockCreator
      autoBlock={state.tool || autoBlock2}
      onChangeAutoBlock={(property, value) => tabDispatch({ type: MODIFY_AUTOBLOCK, property, value })}
    />
  ),
  buildPatch(object, start, end, event) {
    const autoBlockConfig = event.ctrlKey ? invertAutoBlockConfiguration(autoBlock) : autoBlock;

    const width = Math.abs(start.x - end.x) + 1;
    const height = Math.abs(start.y - end.y) + 1;

    // Force rectangle to be at least 2x2
    if (width < 2 || height < 2) {
      return [];
    }

    return drawRectangle(start, end, (x, y, nw, se) => {
      const rectangleWidth = object.data.dimensions[0];
      const index = (y * rectangleWidth) + x;
      const oldBlock = object.data.block[index];

      const suggestedRole = getRoleForPoint(x, y, nw, se);
      const currentRole = getRoleForBlock(oldBlock, autoBlockConfig);
      const role = determineRoleInteraction(currentRole, suggestedRole);

      const newBlock = autoBlockConfig[role];

      return {
        x,
        y,
        block: newBlock,
      };
    });
  },
  reducer(state = autoBlock2, action) {
    switch (action.type) {
      case MODIFY_AUTOBLOCK:
        return {
          ...state,
          [action.property]: action.value,
        };
      default:
        return state;
    }
  },
});
