import React, { useState, useEffect } from "react"
import { Layer, Rect, Stage, Image } from 'react-konva';
import BBox from './BBox'
import Konva from 'konva';

export interface BBoxCanvasLayerProps {
  rectangles: any[],
  mode: string,
  selectedId: string | null,
  setSelectedId: any,
  setRectangles: any,
  setLabel: any,
  color_map: any,
  scale: number,
  label: string,
  image_size: number[],
  image: any,
  strokeWidth: number
}
const BBoxCanvas = (props: BBoxCanvasLayerProps) => {
  const {
    rectangles,
    mode,
    selectedId,
    setSelectedId,
    setRectangles,
    setLabel,
    color_map,
    scale,
    label,
    image_size,
    image,
    strokeWidth
  }: BBoxCanvasLayerProps = props
  rectangles.sort((a, b) => {
    const idA = parseInt(a.id.split('-')[1]);
    const idB = parseInt(b.id.split('-')[1]);
    return idA - idB;
  });
  const [adding, setAdding] = useState<number[] | null>(null)
  const checkDeselect = (e: any) => {
    console.log('DOWN')
    if (!(e.target instanceof Konva.Rect)) {
      if (selectedId === null) {
        if (mode === 'Transform') {
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([pointer.x, pointer.y, pointer.x, pointer.y])
        }
      } else {
        setSelectedId(null);
      }
    }
  };

  useEffect(() => {
    const rects = rectangles.slice();
    for (let i = 0; i < rects.length; i++) {
      if (rects[i].width < 0) {
        rects[i].width = rects[i].width * -1
        rects[i].x = rects[i].x - rects[i].width
        setRectangles(rects)
      }
      if (rects[i].height < 0) {
        rects[i].height = rects[i].height * -1
        rects[i].y = rects[i].y - rects[i].height
        setRectangles(rects)
      }
      if (rects[i].x < 0 || rects[i].y < 0) {
        rects[i].width = rects[i].width + Math.min(0, rects[i].x)
        rects[i].x = Math.max(0, rects[i].x)
        rects[i].height = rects[i].height + Math.min(0, rects[i].y)
        rects[i].y = Math.max(0, rects[i].y)
        setRectangles(rects)
      }
      if (rects[i].x + rects[i].width > image_size[0] || rects[i].y + rects[i].height > image_size[1]) {
        rects[i].width = Math.min(rects[i].width, image_size[0] - rects[i].x)
        rects[i].height = Math.min(rects[i].height, image_size[1] - rects[i].y)
        setRectangles(rects)
      }
      if (rects[i].width < 5 || rects[i].height < 5) {
        rects[i].width = 5
        rects[i].height = 5
      }
    }
    console.log(rects)
  }, [rectangles, image_size])
  return (
    <Stage width={image_size[0] * scale} height={image_size[1] * scale}
      onMouseDown={checkDeselect}
      onMouseMove={(e: any) => {
        if (!(adding === null)) {
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([adding[0], adding[1], pointer.x, pointer.y])
        }
      }}
      onMouseLeave={(e: any) => {
        setAdding(null)
      }}
      onMouseUp={(e: any) => {
        if (!(adding === null)) {
          const rects = rectangles.slice();
          const new_id = Date.now().toString()
          rects.push({
            x: adding[0] / scale,
            y: adding[1] / scale,
            width: (adding[2] - adding[0]) / scale,
            height: (adding[3] - adding[1]) / scale,
            label: label,
            stroke: color_map[label],
            id: new_id
          })
          setRectangles(rects);
          setSelectedId(new_id);
          setAdding(null)
        }
      }}>
      <Layer>
        <Image image={image} scaleX={scale} scaleY={scale} />
      </Layer>
      <Layer>
        {rectangles.map((rect, i) => {
          return (
            <BBox
              key={i}
              rectProps={rect}
              scale={scale}
              strokeWidth={strokeWidth}
              isSelected={mode === 'Transform' && rect.id === selectedId}
              onClick={() => {
                if (mode === 'Transform') {
                  setSelectedId(rect.id);
                  const rects = rectangles.slice();
                  const lastIndex = rects.length - 1;
                  const lastItem = rects[lastIndex];
                  rects[lastIndex] = rects[i];
                  rects[i] = lastItem;
                  setRectangles(rects);
                  setLabel(rect.label)
                } else if (mode === 'Del') {
                  const rects = rectangles.slice();
                  setRectangles(rects.filter((element) => element.id !== rect.id));
                }
              }}
              onChange={(newAttrs: any) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
            />
          );
        })}
        {adding !== null && <Rect fill={color_map[label] + '4D'} x={adding[0]} y={adding[1]} width={adding[2] - adding[0]} height={adding[3] - adding[1]} />}
      </Layer></Stage>
  );
};


export default BBoxCanvas;