import React from 'react';
import createBasicDrawingTool from './createBasicDrawingTool';

// Example cliff
const autoBlock = invertAutoBlockConfiguration({
  // Main blocks
  nw: 0x68, // north-west
  n: 0x69,  // north
  ne: 0x6a, // north-east
  w: 0x70,  // west
  c: 0x71,  // centre
  e: 0x72,  // east
  sw: 0x78, // south-west
  s: 0x79,  // south
  se: 0x7a, // south-east

  // Inside corners
  inw: 0xb2, // inside north-west
  ine: 0xb3, // inside north-east
  isw: 0xba, // inside south-west
  ise: 0xbb, // inside south-east

  // Other
  g: 4, // Ground
});

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

function getRoleForPoint(x, y, nw, se) {
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

function getRoleForBlock(block, autoBlockConfig) {
  return Object.keys(autoBlockConfig).find((x) => autoBlockConfig[x] === block);
}

const roleInteractionPairings = {
  // Right-angle pairs
  'w-n': 'ise',
  'w-s': 'ine',
  'w-ne': 'ise',
  'w-se': 'ine',
  'e-n': 'isw',
  'e-s': 'inw',
  'e-nw': 'isw',
  'e-sw': 'inw',
  'n-e': 'isw',
  'n-w': 'ise',
  'n-se': 'isw',
  'n-sw': 'ise',
  's-e': 'inw',
  's-w': 'ine',
  's-ne': 'inw',
  's-nw': 'ine',

  // Right angle-corner pairs
  'ne-s': 'inw', // same as e-s
  'ne-w': 'ise', // same as n-w
  'nw-s': 'ine', // same as w-s
  'nw-e': 'isw', // same as n-e
  'se-n': 'isw', // same as e-n
  'se-w': 'ine', // same as s-w
  'sw-e': 'inw', // same as s-e
  'sw-n': 'ise', // same as w-n

  // Corner pairs
  'nw-n': 'n',
  'ne-n': 'n',
  'sw-s': 's',
  'se-s': 's',
  'nw-w': 'w',
  'sw-w': 'w',
  'ne-e': 'e',
  'se-e': 'e',
  'n-nw': 'n',
  'n-ne': 'n',
  's-sw': 's',
  's-se': 's',
  'w-nw': 'w',
  'w-sw': 'w',
  'e-ne': 'e',
  'e-se': 'e',
  'sw-se': 's',
  'se-sw': 's',
  'nw-ne': 'n',
  'ne-nw': 'n',
  'ne-se': 'e',
  'nw-sw': 'w',
  'se-ne': 'e',
  'sw-nw': 'w',

  // Explicit center
  'c-n': 'c',
  'c-s': 'c',
  'c-e': 'c',
  'c-w': 'c',
  'c-ne': 'c',
  'c-se': 'c',
  'c-nw': 'c',
  'c-sw': 'c',
  'n-c': 'c',
  's-c': 'c',
  'e-c': 'c',
  'w-c': 'c',
  'ne-c': 'c',
  'se-c': 'c',
  'nw-c': 'c',
  'sw-c': 'c',
  'ine-c': 'c',
  'inw-c': 'c',
  'ise-c': 'c',
  'isw-c': 'c',
  'e-w': 'c',
  'w-e': 'c',
  's-n': 'c',
  'n-s': 'c',
  'inw-nw': 'c',
  'ine-ne': 'c',
  'isw-sw': 'c',
  'ise-se': 'c',
  'ise-s': 'c',
  'ise-e': 'c',
  'isw-s': 'c',
  'isw-w': 'c',
  'ine-e': 'c',
  'ine-n': 'c',
  'inw-w': 'c',
  'inw-n': 'c',

  // Explicit same
  'e-e': 'e',
  'n-n': 'n',
  's-s': 's',
  'w-w': 'w',
  'ne-ne': 'ne',
  'sw-sw': 'sw',
  'nw-nw': 'nw',
  'se-se': 'se',

  // These Corners stay the same
  'ine-nw': 'ine',
  'ine-s': 'ine',
  'ine-se': 'ine',
  'ine-sw': 'ine',
  'ine-w': 'ine',
  'inw-e': 'inw',
  'inw-ne': 'inw',
  'inw-s': 'inw',
  'inw-se': 'inw',
  'inw-sw': 'inw',
  'ise-n': 'ise',
  'ise-ne': 'ise',
  'ise-nw': 'ise',
  'ise-sw': 'ise',
  'ise-w': 'ise',
  'isw-e': 'isw',
  'isw-n': 'isw',
  'isw-ne': 'isw',
  'isw-nw': 'isw',
  'isw-se': 'isw',

  // TODO: These don't actually have tiles
  'nw-se': 'g',
  'ne-sw': 'g',
  'se-nw': 'g',
  'sw-ne': 'g',
};

// TODO: Allow REVERSED pairings (i.e. create a hole in a cliff) when holding CTRL
// TODO: Allow secondary layers
// TODO: Force rectangle to be at least 2x2

function determineRoleInteraction(currentRole, suggestedRole) {
  if (currentRole === undefined || currentRole === suggestedRole || currentRole === 'g') {
    return suggestedRole;
  }

  const result = roleInteractionPairings[`${currentRole}-${suggestedRole}`] || 'g';

  if (result === 'g') {
    console.log(currentRole, suggestedRole, '->', `'${result}'`);
  }

  return result;
}

export default createBasicDrawingTool({
  id: 'auto-tile-tool',
  name: '',
  description: '',
  layers: ['map'],
  icon: <div />,
  component: () => <div>Hello</div>,
  cursor: 'pointer',
  buildPatch(object, start, end) {
    return drawRectangle(start, end, (x, y, nw, se) => {
      const width = object.dimensions[0];
      const index = (y * width) + x;
      const oldBlock = object.block[index];

      const suggestedRole = getRoleForPoint(x, y, nw, se);
      const currentRole = getRoleForBlock(oldBlock, autoBlock);
      const role = determineRoleInteraction(currentRole, suggestedRole);

      const newBlock = autoBlock[role];

      return {
        x,
        y,
        block: newBlock,
      };
    });
  },
});
