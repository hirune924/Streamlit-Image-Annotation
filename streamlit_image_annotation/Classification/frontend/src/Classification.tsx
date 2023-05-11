import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from "streamlit-component-lib"
import React, { useEffect, useState } from "react"
import { ChakraProvider, Select, Box, Spacer, HStack, Center, Text } from '@chakra-ui/react'

import { Stage, Image, Layer } from 'react-konva';
import useImage from 'use-image';
import ThemeSwitcher from './ThemeSwitcher'

export interface PythonArgs {
  image_url: string,
  image_size: number[],
  label_list: string[],
  default_label_idx: number
}
/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
const Classification = ({ args, theme }: ComponentProps) => {
  const {
    image_url,
    image_size,
    label_list,
    default_label_idx
  }: PythonArgs = args

  const params = new URLSearchParams(window.location.search);
  const baseUrl = params.get('streamlitUrl')
  const [image] = useImage(baseUrl + image_url)
  const [label, setLabel] = useState(label_list[default_label_idx])
  const [scale, setScale] = useState(1.0)
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLabel(event.target.value)
    Streamlit.setComponentValue({ 'label': event.target.value })
  }

  useEffect(() => {
    const resizeCanvas = () => {
      const scale_ratio = window.innerWidth * 0.8 / image_size[0]
      setScale(Math.min(scale_ratio, 1.0))
      Streamlit.setFrameHeight(image_size[1] * Math.min(scale_ratio, 1.0))
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas()
  }, [image_size])

  return (
    <ChakraProvider>
      <ThemeSwitcher theme={theme}>
        <Center>
          <HStack>
            <Box width="80%">
              <Stage width={image_size[0] * scale} height={image_size[1] * scale} >
                <Layer>
                  <Image image={image} scaleX={scale} scaleY={scale} />
                </Layer>
              </Stage>
            </Box>
            <Spacer />
            <Box>
              <Text fontSize='sm'>Class</Text>
              <Select value={label} onChange={handleChange}>
                {label_list.map(
                  (l) =>
                    <option value={l}>{l}</option>
                )
                }
              </Select>
            </Box>
          </HStack>
        </Center>
      </ThemeSwitcher>
    </ChakraProvider>
  )

}


export default withStreamlitConnection(Classification)
