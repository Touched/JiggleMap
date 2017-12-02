import React from 'react';

export type SpriteObject = {
  id: string;
  height: number;
  width: number;
  x: number;
  y: number;
  name: string;
  description: string;
};

type SpriteProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  sheet: string,
};

export default function Sprite({ x, y, width, height, sheet }: SpriteProps) {
  const style = {
    background: `url(${sheet})`,
    backgroundPositionX: -x,
    backgroundPositionY: -y,
    minWidth: width,
    minHeight: height,
  };

  return (
    <div style={style} />
  );
}
