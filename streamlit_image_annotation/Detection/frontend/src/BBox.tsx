import React, { useState } from "react"
import { Rect, Text, Transformer } from 'react-konva';

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
  scale: number,
  strokeWidth: number
}
const BBox = (props: BBoxProps) => {
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();
  const {
    rectProps, onChange, isSelected, onClick, scale, strokeWidth
  }: BBoxProps = props
  const [moving, setMoving] = useState(false);

  React.useEffect(() => {
    //if(isSelected){
    trRef.current?.nodes([shapeRef.current]);
    trRef.current?.getLayer().batchDraw();
    //}
  }, [isSelected]);


  return (
    <React.Fragment>
      {moving || <Text text={rectProps.label} x={rectProps.x * scale + 5} y={rectProps.y * scale + 5} fontSize={15} fill={rectProps.stroke} />}
      <Rect
        onClick={onClick}
        ref={shapeRef}
        {...rectProps}
        stroke={''}
        x={rectProps.x * scale}
        y={rectProps.y * scale}
        width={rectProps.width * scale}
        height={rectProps.height * scale}
        //scaleX={scale}
        //scaleY={scale}
        draggable={isSelected}
        strokeWidth={strokeWidth}
        onDragStart={(e) => {
          setMoving(true)
        }}
        onDragEnd={(e) => {
          onChange({
            ...rectProps,
            x: e.target.x() / scale,
            y: e.target.y() / scale,
          });
          setMoving(false)
        }}
        onTransformStart={(e) => {
          setMoving(true)
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          setMoving(false)

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...rectProps,
            x: node.x() / scale,
            y: node.y() / scale,
            // set minimal value
            width: Math.max(5, node.width() * scaleX / scale),
            height: Math.max(5, node.height() * scaleY / scale),
          });
        }}
      />
      <Transformer
        ref={trRef}
        resizeEnabled={isSelected}
        rotateEnabled={false}
        keepRatio={false}
        borderStroke={rectProps.stroke}
        borderStrokeWidth={strokeWidth}
        boundBoxFunc={(oldBox, newBox) => {
          // limit resize
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </React.Fragment>
  );
};


export default BBox;