import React from 'react';
import { Popover2 } from '@blueprintjs/labs';

import SpritePicker from './SpritePicker';

export default class SpritePickerField extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  props: {
    sheet: string;
    sprites: Array;
    onChange: Function;
    categories: Array<{id: string, name: string}>;
  };

  render() {
    const { sheet, sprites, categories, onChange } = this.props;

    const content = (
      <SpritePicker
        sheet={sheet}
        sprites={sprites}
        categories={categories}
        onChange={onChange}
      />
    );

    return (
      <Popover2 content={content}>
        Click
      </Popover2>
    );
  }
}
