import React from 'react';
import { shallow, mount } from 'enzyme';
import CloseIcon from 'mdi-react/CloseIcon';
import AsteriskIcon from 'mdi-react/AsteriskIcon';
import { newTab, closeTab, switchTab, reorderTabs } from '../actions';

import { EditorTabsBar, mapDispatchToProps, reorderElement } from '../EditorTabsBar';
import EditorTab from '../EditorTab';

describe('reorderElement', () => {
  it('moves an element in a list left if given a negative value', () => {
    expect(reorderElement([1, 2, 3, 4], 3, -2)).toEqual([3, 1, 2, 4]);
  });

  it('moves an element in a list right if given a positive value', () => {
    expect(reorderElement([1, 2, 3, 4], 3, 1)).toEqual([1, 2, 4, 3]);
  });

  it('does not move an element in a list if given zero', () => {
    expect(reorderElement([1, 2, 3, 4], 3, 0)).toEqual([1, 2, 3, 4]);
  });

  it('cannot move an item out of bounds', () => {
    expect(reorderElement([1, 2, 3, 4], 3, 100)).toEqual([1, 2, 4, 3]);
    expect(reorderElement([1, 2, 3, 4], 3, -100)).toEqual([3, 1, 2, 4]);
  });

  it('ignores invalid items', () => {
    expect(reorderElement([1, 2, 3, 4], 10, -1)).toEqual([1, 2, 3, 4]);
  });
});

describe('<EditorTabsBar />', () => {
  const tab = {
    icon: null,
    title: 'New Tab',
    kind: null,
    state: null,
    dirty: false,
  };

  const tabs = [{
    id: '0',
    ...tab,
  }, {
    id: '1',
    ...tab,
  }];

  it('renders a list of tabs', () => {
    const wrapper = shallow(<EditorTabsBar tabs={tabs} />);

    expect(wrapper.find(EditorTab).length).toEqual(tabs.length);
    expect(wrapper.find(EditorTab).first().props()).toMatchObject(tab);
  });

  it('switches the tab when clicked', () => {
    const spy = jest.fn();
    const wrapper = mount(<EditorTabsBar tabs={tabs} onSwitchTab={spy} />);
    wrapper.find(EditorTab).first().simulate('click');
    expect(spy).toHaveBeenCalledWith('0');
  });

  describe('dragging', () => {
    it('sets the dragging state on mouse down', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      const tabWrapper = wrapper.find(EditorTab).first();
      tabWrapper.simulate('mousedown', {
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 0,
            width: 200,
          }),
        },
        clientX: 123,
      });

      expect(wrapper.state('dragging')).toEqual({
        id: '0',
        rect: { left: 0, width: 200 },
        translate: 0,
        x: 123,
        order: ['0', '1'],
        moved: false,
      });
    });

    it('adds the dragging class while dragging', () => {
      const wrapper = mount(<EditorTabsBar tabs={tabs} />);
      const editorTabs = wrapper.find('[className="EditorTabsBar"]');
      expect(editorTabs.prop('className')).not.toMatch('EditorTabsBar--dragging');

      wrapper.setState({
        dragging: {
          order: [],
          rect: {
            width: 200,
          },
        },
      });
      expect(editorTabs.prop('className')).not.toMatch('EditorTabsBar--dragging');

      wrapper.setState({
        dragging: {
          order: [],
          moved: true,
          rect: {
            width: 200,
          },
        },
      });
      expect(editorTabs.prop('className')).toMatch('EditorTabsBar--dragging');
    });

    it('translates the tabs', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      wrapper.setState({
        dragging: {
          id: '0',
          translate: 123,
          order: ['0', '1'],
          rect: {
            width: 100,
          },
        },
      });

      expect(wrapper.find(EditorTab).first().prop('style')).toEqual({
        transform: 'translate(123px)',
      });

      expect(wrapper.find(EditorTab).last().prop('style')).toEqual({
        transform: 'translate(0px)',
      });
    });

    it('translates the non-dragged tabs so that they appear in the new order', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      wrapper.setState({
        dragging: {
          id: '0',
          translate: 123,
          order: ['1', '0'],
          rect: {
            width: 100,
          },
        },
      });

      expect(wrapper.find(EditorTab).last().prop('style')).toEqual({
        transform: 'translate(-100px)',
      });
    });

    it('reorders the tabs after a drag is finished', () => {
      const spy = jest.fn();
      const wrapper = shallow(<EditorTabsBar tabs={tabs} onReorder={spy} />);
      wrapper.setState({
        dragging: {
          order: ['1', '0'],
          rect: {
            width: 100,
          },
        },
      });

      wrapper.simulate('mouseup');

      expect(spy).toHaveBeenCalledWith(['1', '0']);
      expect(wrapper.state('dragging')).toEqual(null);
    });

    it('does not reorder the tabs if there was no drag event', () => {
      const spy = jest.fn();
      const wrapper = shallow(<EditorTabsBar tabs={tabs} onReorder={spy} />);
      wrapper.simulate('mouseup');
      expect(spy).not.toHaveBeenCalledWith(['1', '0']);
    });

    it('sets the intial dragging state', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      expect(wrapper.state('dragging')).toEqual(null);
    });

    it('ignores mouse movement when not dragging', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      wrapper.simulate('mousemove');
      expect(wrapper.state()).toEqual({
        closing: null,
        dragging: null,
      });
    });

    describe('moving', () => {
      beforeEach(() => {
        Element.prototype.getBoundingClientRect = () => ({
          left: 50,
          right: 1000,
        });
      });

      const dragging = {
        id: '0',
        rect: {
          left: 100,
          right: 300,
          width: 200,
        },
        translate: 0,
        x: 123,
        order: ['0', '1'],
        moved: false,
      };

      it('does mark the mouse movement if no movement occured', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({ dragging });
        const event = { clientX: 123 };
        wrapper.simulate('mousemove', event);

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          moved: false,
          translate: 0,
        });
      });

      it('marks the mouse as moved if movement occured', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({ dragging });
        const event = { clientX: 124 };
        wrapper.simulate('mousemove', event);

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          moved: true,
          translate: 1,
        });
      });

      it('keeps the movement state event if the mouse moves back', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({ dragging });
        wrapper.simulate('mousemove', { clientX: 124 });
        wrapper.simulate('mousemove', { clientX: 123 });

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          moved: true,
          translate: 0,
        });
      });

      it('swaps tabs if they move over the left swap threshold', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({
          dragging: {
            ...dragging,
            id: '2',
            order: ['0', '1', '2', '3', '4'],
            x: 100,
          },
        });

        wrapper.simulate('mousemove', { clientX: 200 });

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          moved: true,
          x: 100,
          translate: 100,
          id: '2',
          order: ['0', '2', '1', '3', '4'],
        });
      });

      it('swaps tabs if they move over the right swap threshold', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({
          dragging: {
            ...dragging,
            id: '2',
            order: ['0', '1', '2', '3', '4'],
            x: 100,
          },
        });

        wrapper.simulate('mousemove', { clientX: 600 });

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          moved: true,
          translate: 500,
          x: 100,
          id: '2',
          order: ['0', '1', '3', '2', '4'],
        });
      });

      it('ignores mouse movements that would take the tabs out of bounds', () => {
        const wrapper = mount(<EditorTabsBar tabs={tabs} />);

        wrapper.setState({ dragging });
        wrapper.simulate('mousemove', { clientX: -600 });

        expect(wrapper.state('dragging')).toEqual({
          ...dragging,
          translate: 0,
        });
      });
    });
  });

  describe('closing', () => {
    it('sets the intial closing state', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      expect(wrapper.state('closing')).toEqual(null);
    });

    it('freezes the tab width when closing', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      wrapper.setState({ closing: { width: 123 } });

      expect(wrapper.find(EditorTab).first().prop('style')).toEqual({
        maxWidth: '123px',
      });
    });

    it('resets the closing state when the mouse moves', () => {
      const wrapper = shallow(<EditorTabsBar tabs={tabs} />);
      wrapper.setState({ closing: { width: 123 } });
      wrapper.simulate('mousemove');
      expect(wrapper.state('closing')).toEqual(null);
    });

    it('closes the tab when the button is clicked', () => {
      const spy = jest.fn();
      const wrapper = mount(<EditorTabsBar tabs={tabs} onCloseTab={spy} />);
      wrapper.find(EditorTab).first().prop('onClose')();
      expect(spy).toHaveBeenCalledWith('0');
    });
  });
});

describe('<EditorTab />', () => {
  it('renders the tab name', () => {
    const wrapper = shallow(<EditorTab title="Test" />);
    expect(wrapper.contains('Test')).toBe(true);
  });

  it('renders a close button', () => {
    const wrapper = shallow(<EditorTab title="Test" />);
    expect(wrapper.find('button[className="EditorTabsBar__tab__close"]').node).toBeDefined();
    expect(wrapper.find(CloseIcon).node).toBeDefined();
  });

  it('calls onClose when the close button is clicked', () => {
    const spy = jest.fn();
    const event = {
      stopPropagation: jest.fn(),
    };
    const wrapper = shallow(<EditorTab title="Test" onClose={spy} />);
    const closeButton = wrapper.find('button[className="EditorTabsBar__tab__close"]');

    closeButton.simulate('click', event);
    expect(spy).toHaveBeenCalledWith(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('calls onSelect when the tab is clicked', () => {
    const spy = jest.fn();
    const event = {};
    const wrapper = shallow(<EditorTab title="Test" onSelect={spy} />);

    wrapper.simulate('click', event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('calls onMouseDown and onSelect when the tab receives mouseDown', () => {
    const clickSpy = jest.fn();
    const mouseDownSpy = jest.fn();
    const event = {};
    const wrapper = shallow(
      <EditorTab title="Test" onSelect={mouseDownSpy} onMouseDown={clickSpy} />,
    );

    wrapper.simulate('mousedown', event);
    expect(clickSpy).toHaveBeenCalledWith(event);
    expect(mouseDownSpy).toHaveBeenCalledWith(event);
  });

  it('renders an asterisk instead of a close icon if the dirty prop is set', () => {
    const wrapper = shallow(<EditorTab title="Test" dirty />);
    expect(wrapper.find(CloseIcon).node).not.toBeDefined();
    expect(wrapper.find(AsteriskIcon).node).toBeDefined();
  });

  it('renders the active class when the tab is active', () => {
    const wrapper = shallow(<EditorTab title="Test" active />);
    expect(
      wrapper.find('[className="EditorTabsBar__tab EditorTabsBar__tab--active"]').node,
    ).toBeDefined();
  });
});

describe('mapDispatchToProps', () => {
  it('maps onNewTab', () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onNewTab();
    expect(dispatch).toHaveBeenCalledWith(newTab());
  });

  it('maps onCloseTab', () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onCloseTab('1');
    expect(dispatch).toHaveBeenCalledWith(closeTab('1'));
  });

  it('maps onSwitchTab', () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onSwitchTab('1');
    expect(dispatch).toHaveBeenCalledWith(switchTab('1'));
  });

  it('maps onReorder', () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onReorder(['1']);
    expect(dispatch).toHaveBeenCalledWith(reorderTabs(['1']));
  });
});
