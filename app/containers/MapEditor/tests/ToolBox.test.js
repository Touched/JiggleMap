import { buildToolListForLayer } from '../ToolBox';

describe('buildToolListForLayer', () => {
  const tools = [{
    id: 'd',
    type: 'mouse',
    layers: ['map', 'collision'],
  }, {
    id: 'z',
    type: 'action',
    layers: ['map', 'collision'],
  }, {
    id: 'b',
    type: 'mouse',
    layers: ['map'],
  }, {
    id: 'a',
    type: 'action',
    layers: ['map', 'collision'],
  }];

  it('sorts the tool by type adding separators between different types', () => {
    const list = buildToolListForLayer(tools, 'map');

    expect(list).toMatchObject([{
      id: 'd',
      type: 'mouse',
    }, {
      id: 'b',
      type: 'mouse',
    }, {
      type: 'separator',
    }, {
      id: 'z',
      type: 'action',
    }, {
      id: 'a',
      type: 'action',
    }]);
  });

  it('only returns the tools that apply to this layer', () => {
    const list = buildToolListForLayer(tools, 'collision');

    expect(list).toMatchObject([{
      id: 'd',
      type: 'mouse',
    }, {
      type: 'separator',
    }, {
      id: 'z',
      type: 'action',
    }, {
      id: 'a',
      type: 'action',
    }]);
  });
});
