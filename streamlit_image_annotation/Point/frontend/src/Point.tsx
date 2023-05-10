import React, { useState, useEffect } from "react"
import { Circle, Rect, Text, Transformer } from 'react-konva';

export interface RectProps {
  x: number,
  y: number,
  width: number,
  height: number,
  id: string,
  stroke: string,
  label: string,
}
export interface BBoxProps {
  rectProps: RectProps,
  onChange: any,
  isSelected: boolean,
  onClick: any,
  scale: number
}
const Point = (props: BBoxProps)=>{
  const {
    rectProps, onChange, isSelected, onClick, scale
  }: BBoxProps = props

  return (
    <React.Fragment>
      <Circle
        onClick={onClick}
        {...rectProps}
        x={rectProps.x * scale}
        y={rectProps.y * scale}
        width={10}
        height={10}
        draggable={isSelected}
        strokeWidth={isSelected?12:3}
        onDragEnd={(e) => {
          onChange({
            ...rectProps,
            x: e.target.x() / scale,
            y: e.target.y() / scale,
          });
        }}
      />
    </React.Fragment>
  );
};


export default Point;