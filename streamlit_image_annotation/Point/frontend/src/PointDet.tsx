import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from "streamlit-component-lib"
import React, { useEffect, useState } from "react"
import { ChakraProvider, Select, Box, Spacer, HStack, Center, Text, Button } from '@chakra-ui/react'

import useImage from 'use-image';
import ThemeSwitcher from './ThemeSwitcher'
import PointCanvas from "./PointCanvas";

export interface PythonArgs {
  image_url: string,
  image_size: number[],
  label_list: string[],
  points_info: any[],
  color_map: any,
  point_width: number,
  use_space: boolean,
}

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
const PointDet = ({ args, theme }: ComponentProps) => {
  const {
    image_url,
    image_size,
    label_list,
    points_info,
    color_map,
    point_width,
    use_space
  }: PythonArgs = args

  const params = new URLSearchParams(window.location.search);
  const baseUrl = params.get('streamlitUrl')

  // Construct image URL
  let imageUrl: string
  if (baseUrl) {
    const url = new URL(baseUrl)
    // If baseUrl doesn't end with '/', it likely includes a page name - remove it
    const cleanPath = url.pathname.endsWith('/')
      ? url.pathname
      : url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
    imageUrl = url.origin + cleanPath + image_url.substring(1)
  } else {
    imageUrl = image_url
  }

  const [image] = useImage(imageUrl)
  const [pointsInfo, setPointsInfo] = React.useState(
    points_info.map((p, i) => {
      return {
        x: p.point[0],
        y: p.point[1],
        label: p.label,
        stroke: color_map[p.label],
        id: 'point-' + i
      }
    }));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [label, setLabel] = useState(label_list[0])
  const [mode, setMode] = React.useState<string>('Transform');

  const handleClassSelectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLabel(event.target.value)
    console.log(selectedId)
    if (!(selectedId === null)) {
      const points = pointsInfo.slice();
      for (let i = 0; i < points.length; i++) {
        if (points[i].id === selectedId) {
          points[i].label = event.target.value;
          points[i].stroke = color_map[points[i].label]
        }
      }
      setPointsInfo(points)
    }
  }
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
    const handleKeyPress = (event: KeyboardEvent) => {
      if (use_space && event.key === ' ') { // 32 is the key code for Space key
        const currentPointsValue = pointsInfo.map((point, i) => {
          return {
            point: [point.x, point.y],
            label_id: label_list.indexOf(point.label),
            label: point.label
          }
        })
        Streamlit.setComponentValue(currentPointsValue)
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [pointsInfo]); 

  return (
    <ChakraProvider>
      <ThemeSwitcher theme={theme}>
        <Center>
          <HStack>
            <Box width="80%">
              <PointCanvas
                pointsInfo={pointsInfo}
                mode={mode}
                selectedId={selectedId}
                scale={scale}
                setSelectedId={setSelectedId}
                setPointsInfo={setPointsInfo}
                setLabel={setLabel}
                color_map={color_map}
                label={label}
                image={image}
                image_size={image_size}
                strokeWidth={point_width}
              />
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
                const currentPointsValue = pointsInfo.map((point, i) => {
                  return {
                    point: [point.x, point.y],
                    label_id: label_list.indexOf(point.label),
                    label: point.label
                  }
                })
                Streamlit.setComponentValue(currentPointsValue)
              }}>Complete</Button>
            </Box>
          </HStack>
        </Center>
      </ThemeSwitcher>
    </ChakraProvider>
  )

}


export default withStreamlitConnection(PointDet)
