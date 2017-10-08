import { getRoleForPoint, getRoleForBlock, determineRoleInteraction } from '../autoBlockTool';

describe('autoBlockTool', () => {
  describe('getRoleForPoint', () => {
    it('determines the name of the square given a rectangle', () => {
      const nw = { x: 1, y: 1 };
      const se = { x: 10, y: 10 };

      expect(getRoleForPoint(1, 1, nw, se)).toEqual('nw');
      expect(getRoleForPoint(10, 1, nw, se)).toEqual('ne');
      expect(getRoleForPoint(1, 10, nw, se)).toEqual('sw');
      expect(getRoleForPoint(10, 10, nw, se)).toEqual('se');
      expect(getRoleForPoint(2, 1, nw, se)).toEqual('n');
      expect(getRoleForPoint(2, 10, nw, se)).toEqual('s');
      expect(getRoleForPoint(10, 2, nw, se)).toEqual('e');
      expect(getRoleForPoint(1, 2, nw, se)).toEqual('w');
      expect(getRoleForPoint(2, 2, nw, se)).toEqual('c');
    });
  });

  describe('getRoleForBlock', () => {
    it('determines the name of the square block index', () => {
      expect(getRoleForBlock(71, {
        nw: 71,
        se: 70,
      })).toEqual('nw');
    });
  });

  describe('determineRoleInteraction', () => {
    function expectPairingsMatch(roleInteractions) {
      roleInteractions.forEach((item) => {
        const [currentRole, overlayedRole, expectedRole] = item;
        expect(determineRoleInteraction(currentRole, overlayedRole)).toEqual(expectedRole);
      });
    }

    it('if two outer straight walls meet at a right angle, they become an inner wall', () => {
      const interactions = [
        ['w', 'n', 'ise'],
        ['w', 's', 'ine'],
        ['e', 'n', 'isw'],
        ['e', 's', 'inw'],
        ['n', 'e', 'isw'],
        ['n', 'w', 'ise'],
        ['s', 'e', 'inw'],
        ['s', 'w', 'ine'],
      ];

      expectPairingsMatch(interactions);
    });

    it('joins outer corners with walls', () => {
      const interactions = [
        ['ne', 's', 'inw'], // same as e-s
        ['ne', 'w', 'ise'], // same as n-w
        ['nw', 's', 'ine'], // same as w-s
        ['nw', 'e', 'isw'], // same as n-e
        ['se', 'n', 'isw'], // same as e-n
        ['se', 'w', 'ine'], // same as s-w
        ['sw', 'e', 'inw'], // same as s-e
        ['sw', 'n', 'ise'], // same as w-n
        ['w', 'ne', 'ise'],
        ['w', 'se', 'ine'],
        ['e', 'nw', 'isw'],
        ['e', 'sw', 'inw'],
        ['n', 'se', 'isw'],
        ['n', 'sw', 'ise'],
        ['s', 'ne', 'inw'],
        ['s', 'nw', 'ine'],
      ];

      expectPairingsMatch(interactions);
    });

    it('changes some corners to straight walls', () => {
      const interactions = [
        ['nw', 'n', 'n'],
        ['ne', 'n', 'n'],
        ['sw', 's', 's'],
        ['se', 's', 's'],
        ['nw', 'w', 'w'],
        ['sw', 'w', 'w'],
        ['ne', 'e', 'e'],
        ['se', 'e', 'e'],
        ['n', 'nw', 'n'],
        ['n', 'ne', 'n'],
        ['s', 'sw', 's'],
        ['s', 'se', 's'],
        ['w', 'nw', 'w'],
        ['w', 'sw', 'w'],
        ['e', 'ne', 'e'],
        ['e', 'se', 'e'],
        ['sw', 'se', 's'],
        ['se', 'sw', 's'],
        ['nw', 'ne', 'n'],
        ['ne', 'nw', 'n'],
        ['ne', 'se', 'e'],
        ['nw', 'sw', 'w'],
        ['se', 'ne', 'e'],
        ['sw', 'nw', 'w'],
      ];

      expectPairingsMatch(interactions);
    });

    it('draws joins overlapping blocks with center tiles', () => {
      const interactions = [
        ['c', 'n', 'c'],
        ['c', 's', 'c'],
        ['c', 'e', 'c'],
        ['c', 'w', 'c'],
        ['c', 'ne', 'c'],
        ['c', 'se', 'c'],
        ['c', 'nw', 'c'],
        ['c', 'sw', 'c'],
        ['n', 'c', 'c'],
        ['s', 'c', 'c'],
        ['e', 'c', 'c'],
        ['w', 'c', 'c'],
        ['ne', 'c', 'c'],
        ['se', 'c', 'c'],
        ['nw', 'c', 'c'],
        ['sw', 'c', 'c'],
        ['ine', 'c', 'c'],
        ['inw', 'c', 'c'],
        ['ise', 'c', 'c'],
        ['isw', 'c', 'c'],
        ['e', 'w', 'c'],
        ['w', 'e', 'c'],
        ['s', 'n', 'c'],
        ['n', 's', 'c'],
        ['inw', 'nw', 'c'],
        ['ine', 'ne', 'c'],
        ['isw', 'sw', 'c'],
        ['ise', 'se', 'c'],
        ['ise', 's', 'c'],
        ['ise', 'e', 'c'],
        ['isw', 's', 'c'],
        ['isw', 'w', 'c'],
        ['ine', 'e', 'c'],
        ['ine', 'n', 'c'],
        ['inw', 'w', 'c'],
        ['inw', 'n', 'c'],
      ];

      expectPairingsMatch(interactions);
    });

    it('does not change the block if the overlapping blocks are identical', () => {
      const interactions = [
        ['e', 'e', 'e'],
        ['n', 'n', 'n'],
        ['s', 's', 's'],
        ['w', 'w', 'w'],
        ['ne', 'ne', 'ne'],
        ['sw', 'sw', 'sw'],
        ['nw', 'nw', 'nw'],
        ['se', 'se', 'se'],
      ];

      expectPairingsMatch(interactions);
    });

    it('leaves inner corners unchanged in some cases', () => {
      const interactions = [
        ['ine', 'nw', 'ine'],
        ['ine', 's', 'ine'],
        ['ine', 'se', 'ine'],
        ['ine', 'sw', 'ine'],
        ['ine', 'w', 'ine'],
        ['inw', 'e', 'inw'],
        ['inw', 'ne', 'inw'],
        ['inw', 's', 'inw'],
        ['inw', 'se', 'inw'],
        ['inw', 'sw', 'inw'],
        ['ise', 'n', 'ise'],
        ['ise', 'ne', 'ise'],
        ['ise', 'nw', 'ise'],
        ['ise', 'sw', 'ise'],
        ['ise', 'w', 'ise'],
        ['isw', 'e', 'isw'],
        ['isw', 'n', 'isw'],
        ['isw', 'ne', 'isw'],
        ['isw', 'nw', 'isw'],
        ['isw', 'se', 'isw'],
      ];

      expectPairingsMatch(interactions);
    });

    xit('marks opposite corner tiles as un-mergeable', () => {
      // TODO: These don't actually have tiles
      const interactions = [
        ['nw', 'se', 'g'],
        ['ne', 'sw', 'g'],
        ['se', 'nw', 'g'],
        ['sw', 'ne', 'g'],
      ];

      expectPairingsMatch(interactions);
    });
  });
});
