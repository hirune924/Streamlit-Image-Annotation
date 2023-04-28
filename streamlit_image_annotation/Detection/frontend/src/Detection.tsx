import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from "streamlit-component-lib"
import React, { useEffect, useState } from "react"
import { ChakraProvider, Select, Box, Spacer, HStack, Center, Button, Text, extendTheme } from '@chakra-ui/react'


import Konva from 'konva';
import { Stage, Image, Layer, Rect } from 'react-konva';
import useImage from 'use-image';

import BBox from './BBox'
import ThemeSwitcher from './ThemeSwitcher'

export interface PythonArgs {
  image_url: string,
  image_size: number[],
  label_list: string[],
  bbox_info: any[],
  color_map: any
}

const Detection = ({ args, theme }: ComponentProps) => {
  const {
    image_url,
    image_size,
    label_list,
    bbox_info,
    color_map
  }: PythonArgs = args

  const params = new URLSearchParams(window.location.search);
  const baseUrl = params.get('streamlitUrl')
  const [image] = useImage(baseUrl + image_url)

  const [rectangles, setRectangles] = React.useState(
    bbox_info.map((bb, i) => {
      return {
        x: bb.bbox[0],
        y: bb.bbox[1],
        width: bb.bbox[2],
        height: bb.bbox[3],
        label: bb.label,
        //label_id: bb.label_id,
        stroke: color_map[bb.label],
        id: 'bbox-' + i
      }
    }));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [label, setLabel] = useState(label_list[0])
  const [mode, setMode] = React.useState<string>('Transform');
  const [adding, setAdding] = React.useState<number[] | null>(null)

  const handleClassSelectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLabel(event.target.value)
    console.log(selectedId)
    if (!(selectedId === null)) {
      const rects = rectangles.slice();
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].id === selectedId) {
          rects[i].label = event.target.value;
          rects[i].stroke = color_map[rects[i].label]
        }
      }
      setRectangles(rects)
    }
  }
  const checkDeselect = (e: any) => {
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
  const [scale, setScale] = useState(1.0)
  useEffect(() => {
    const resizeCanvas = () => {
      const scale_ratio = window.innerWidth * 0.8 / image_size[0]
      setScale(Math.min(scale_ratio, 1.0))
      Streamlit.setFrameHeight(image_size[1] * Math.min(scale_ratio, 1.0))
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas()
  }, [image_size])

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
    <ChakraProvider>
      <ThemeSwitcher theme={theme}>
        <Center>
          <HStack>
            <Box width="80%">
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
                    rects.push({ x: adding[0] / scale, y: adding[1] / scale, width: (adding[2] - adding[0]) / scale, height: (adding[3] - adding[1]) / scale, label: label, stroke: color_map[label], id: new_id })
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
                </Layer>
              </Stage>
            </Box>
            <Spacer />
            <Box>

              <Text fontSize='sm'>Mode</Text>
              <Select value={mode} onChange={(e) => { setMode(e.target.value) }}>
                {['Transform', 'Del'].map(
                  (m) =>
                    <option value={m}>{m}</option>
                )}
              </Select>
              <Text fontSize='sm'>Class</Text>
              <Select value={label} onChange={handleClassSelectorChange}>
                {label_list.map(
                  (l) =>
                    <option value={l}>{l}</option>
                )
                }
              </Select>

              <Button onClick={(e) => {
                const currentBboxValue = rectangles.map((rect, i) => {
                  return {
                    bbox: [rect.x, rect.y, rect.width, rect.height],
                    label_id: label_list.indexOf(rect.label),
                    label: rect.label

                  }
                })
                Streamlit.setComponentValue(currentBboxValue)
              }}>Complete</Button>
            </Box>
          </HStack>
        </Center>
      </ThemeSwitcher>
    </ChakraProvider>
  )

}


export default withStreamlitConnection(Detection)
