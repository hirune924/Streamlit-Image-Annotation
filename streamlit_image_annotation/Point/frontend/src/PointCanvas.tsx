import React, { useEffect } from "react"
import { Layer, Stage, Image } from 'react-konva';
import Point from './Point'
import Konva from 'konva';

export interface PointCanvasProps {
  pointsInfo: any[],
  mode: string,
  selectedId: string | null,
  setSelectedId: any,
  setPointsInfo: any,
  setLabel: any,
  color_map: any,
  scale: number,
  label: string,
  image_size: number[],
  image: any,
  strokeWidth: number
}
const PointCanvas = (props: PointCanvasProps) => {
  const {
    pointsInfo,
    mode,
    selectedId,
    setSelectedId,
    setPointsInfo,
    setLabel,
    color_map,
    scale,
    label,
    image_size,
    image,
    strokeWidth
  }: PointCanvasProps = props
  const checkDeselect = (e: any) => {
    console.log('DOWN')
    if (!(e.target instanceof Konva.Circle)) {
      if (selectedId === null) {
        if (mode === 'Transform') {
          const pointer = e.target.getStage().getPointerPosition()
          const points = pointsInfo.slice();
          const new_id = Date.now().toString()
          points.push({
            x: pointer.x / scale,
            y: pointer.y / scale,
            label: label,
            stroke: color_map[label],
            id: new_id
          })
          setPointsInfo(points);
          setSelectedId(new_id);
        }
      } else {
        setSelectedId(null);
      }
    }
  };

  useEffect(() => {
    const points = pointsInfo.slice();
    for (let i = 0; i < points.length; i++) {
      if (points[i].x < 0 || points[i].y < 0) {
        points[i].x = Math.max(0, points[i].x)
        points[i].y = Math.max(0, points[i].y)
        setPointsInfo(points)
      }
      if (points[i].x > image_size[0] || points[i].y > image_size[1]) {
        points[i].x = Math.min(points[i].x, image_size[0])
        points[i].y = Math.min(points[i].y, image_size[1])
        setPointsInfo(points)
      }
    }
    console.log(pointsInfo)
  }, [pointsInfo, image_size])
  return (
    <Stage width={image_size[0] * scale} height={image_size[1] * scale}
      onMouseDown={checkDeselect}>
      <Layer>
        <Image image={image} scaleX={scale} scaleY={scale} />
      </Layer>
      <Layer>
        {pointsInfo.map((point, i) => {
          return (
            <Point
              key={i}
              rectProps={point}
              scale={scale}
              strokeWidth={strokeWidth}
              isSelected={mode === 'Transform' && point.id === selectedId}
              onClick={() => {
                if (mode === 'Transform') {
                  setSelectedId(point.id);
                  const points = pointsInfo.slice();
                  const lastIndex = points.length - 1;
                  const lastItem = points[lastIndex];
                  points[lastIndex] = points[i];
                  points[i] = lastItem;
                  setPointsInfo(points);
                  setLabel(point.label)
                } else if (mode === 'Del') {
                  const points = pointsInfo.slice();
                  setPointsInfo(points.filter((element) => element.id !== point.id));
                }
              }}
              onChange={(newAttrs: any) => {
                const points = pointsInfo.slice();
                points[i] = newAttrs;
                setPointsInfo(points);
              }}
            />
          );
        })}
      </Layer></Stage>
  );
};


export default PointCanvas;