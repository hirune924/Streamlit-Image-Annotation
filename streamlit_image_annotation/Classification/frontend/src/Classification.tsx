import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from "streamlit-component-lib"
import React, { useEffect, useState } from "react"
import { ChakraProvider, Select, Flex, Box, Spacer, VStack, HStack, Center} from '@chakra-ui/react'

import { Stage, Image, Layer, Rect, Text } from 'react-konva';
import useImage from 'use-image';

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
const Classification = ({ args }: ComponentProps) => {
  const {
    image_url,
    image_size,
    label_list,
    default_label_idx
    }: PythonArgs = args

  const params = new URLSearchParams(window.location.search);
  const baseUrl = params.get('streamlitUrl')
  const [image] = useImage(baseUrl+image_url)
  const [label, setLabel] = useState(label_list[default_label_idx])
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLabel(event.target.value)
    Streamlit.setComponentValue({'label': event.target.value})
  }

  useEffect(() => {
      Streamlit.setFrameHeight(image_size[1])
    }, [])

  return (
          <ChakraProvider>
            <Center>
              <HStack>
                <Box width="80%">
                  <Stage  width={window.innerWidth*0.8} height={image_size[1]} >
                    <Layer x={0} y={0} width={window.innerWidth*0.8} height={image_size[1]}>
                      <Image image={image} />
                    </Layer>
                  </Stage>
                </Box>
                <Spacer />
                <Box>
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
          </ChakraProvider>
      )

}


export default withStreamlitConnection(Classification)
//export default Classification
