import React, { useState, useEffect, useRef } from "react"
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
  const [adding, setAdding] = useState<number[] | null>(null)
  const [isOutside, setIsOutside] = useState<boolean>(false)
  const addingRef = useRef<number[] | null>(null)

  useEffect(() => {
    addingRef.current = adding
  }, [adding])

  const canvasWidth = image_size[0] * scale
  const canvasHeight = image_size[1] * scale

  const clampToCanvas = (x: number, y: number): [number, number] => {
    return [
      Math.max(0, Math.min(canvasWidth, x)),
      Math.max(0, Math.min(canvasHeight, y))
    ]
  }

  const createBoundingBox = (endX: number, endY: number) => {
    const currentAdding = addingRef.current
    if (currentAdding === null) return
    const [clampedX, clampedY] = clampToCanvas(endX, endY)
    const rects = rectangles.slice();
    const new_id = Date.now().toString()
    rects.push({
      x: currentAdding[0] / scale,
      y: currentAdding[1] / scale,
      width: (clampedX - currentAdding[0]) / scale,
      height: (clampedY - currentAdding[1]) / scale,
      label: label,
      stroke: color_map[label],
      id: new_id
    })
    setRectangles(rects);
    setSelectedId(new_id);
    addingRef.current = null
    setAdding(null)
  }

  useEffect(() => {
    if (adding === null || !isOutside) return
    const handleGlobalMouseUp = () => {
      if (addingRef.current !== null) {
        createBoundingBox(addingRef.current[2], addingRef.current[3])
      }
    }
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (addingRef.current !== null) {
        const stage = document.querySelector('.konvajs-content')?.parentElement
        if (stage) {
          const rect = stage.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const [clampedX, clampedY] = clampToCanvas(x, y)
          setAdding([addingRef.current[0], addingRef.current[1], clampedX, clampedY])
        }
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [adding, isOutside])

  const checkDeselect = (e: any) => {
    console.log('DOWN')
    if (!(e.target instanceof Konva.Rect)) {
      if (selectedId === null) {
        if (mode === 'Transform') {
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([pointer.x, pointer.y, pointer.x, pointer.y])
          setIsOutside(false)
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
    <Stage width={canvasWidth} height={canvasHeight}
      onMouseDown={checkDeselect}
      onMouseMove={(e: any) => {
        if (addingRef.current !== null) {
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([addingRef.current[0], addingRef.current[1], pointer.x, pointer.y])
        }
      }}
      onMouseLeave={() => {
        setIsOutside(true)
        if (addingRef.current !== null) {
          const [clampedX, clampedY] = clampToCanvas(addingRef.current[2], addingRef.current[3])
          setAdding([addingRef.current[0], addingRef.current[1], clampedX, clampedY])
        }
      }}
      onMouseEnter={(e: any) => {
        setIsOutside(false)
        if (addingRef.current !== null) {
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([addingRef.current[0], addingRef.current[1], pointer.x, pointer.y])
        }
      }}
      onMouseUp={(e: any) => {
        if (addingRef.current !== null) {
          const pointer = e.target.getStage().getPointerPosition()
          createBoundingBox(pointer.x, pointer.y)
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
