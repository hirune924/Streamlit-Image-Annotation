import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps
} from "streamlit-component-lib"
import React, { useEffect, useState } from "react"
import { ChakraProvider, Select, Box, Spacer, HStack, Center, Button, VStack} from '@chakra-ui/react'

import Konva from 'konva';
import { Stage, Image, Layer, Rect, Text, Transformer } from 'react-konva';
import useImage from 'use-image';

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
  onChange:any,
  isSelected: boolean,
  onSelect: any
  mode: string
}
const BBox = (props: BBoxProps) => {
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();
  const {
    rectProps, onChange, isSelected, onSelect, mode
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
      {moving||<Text text={rectProps.label} x={rectProps.x+5} y={rectProps.y+5} fontSize={15} fill={rectProps.stroke}/>}
      <Rect
        onClick={onSelect}
        ref={shapeRef}
        {...rectProps}
        stroke={''}
        draggable={mode==='Transform'}
        strokeWidth={5}
        onDragStart={(e) => {
          setMoving(true)
        }}
        onDragEnd={(e) => {
          onChange({
            ...rectProps,
            x: e.target.x(),
            y: e.target.y(),
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
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      <Transformer
        ref={trRef}
        resizeEnabled={isSelected}
        rotateEnabled={false}
        keepRatio={false}
        borderStroke={rectProps.stroke}
        borderStrokeWidth={5}
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


export interface PythonArgs {
  image_url: string,
  image_size: number[],
  label_list: string[],
  bbox_info: any[],
  color_map: any
}

const Detection = ({ args }: ComponentProps) => {
  const {
    image_url,
    image_size,
    label_list,
    bbox_info,
    color_map
    }: PythonArgs = args

  const params = new URLSearchParams(window.location.search);
  const baseUrl = params.get('streamlitUrl')
  const [image] = useImage(baseUrl+image_url)
  
  const [rectangles, setRectangles] = React.useState(
    bbox_info.map((bb, i)=>{
      return{
        x: bb.bbox[0], 
        y: bb.bbox[1], 
        width: bb.bbox[2], 
        height: bb.bbox[3], 
        label: bb.label, 
        //label_id: bb.label_id,
        stroke: color_map[bb.label], 
        id: 'bbox-'+i}}));
  const [selectedId, setSelectedId] = React.useState<string|null>(null);
  const [label, setLabel] = useState(label_list[0])
  const [mode, setMode] = React.useState<string>('Transform');
  const [adding, setAdding] = React.useState<number[]|null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLabel(event.target.value)
    console.log(selectedId)
    if(!(selectedId===null)){
      const rects = rectangles.slice();
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].id === selectedId) {
          rects[i].label = event.target.value;
          rects[i].stroke = color_map[rects[i].label]
        }
      }
      setRectangles(rects)
    }
    //Streamlit.setComponentValue({'label': event.target.value})
  }
  const checkDeselect = (e: any) => {
    if (!(e.target instanceof Konva.Rect)) {
      if(selectedId===null){
        if(mode==='Transform'){
          const pointer = e.target.getStage().getPointerPosition()
          setAdding([pointer.x, pointer.y, pointer.x, pointer.y])
        }
      }else{
        setSelectedId(null);
    }
    }
  };

  useEffect(() => {
      Streamlit.setFrameHeight(image_size[1])
    }, [image_size])

  useEffect(() => {
      const rects = rectangles.slice();
      for (let i = 0; i < rects.length; i++) {
          if(rects[i].width<0){
            rects[i].width = rects[i].width * -1
            rects[i].x = rects[i].x - rects[i].width
            setRectangles(rects)
          }
          if(rects[i].height<0){
            rects[i].height = rects[i].height * -1
            rects[i].y = rects[i].y - rects[i].height
            setRectangles(rects)
          }
          if(rects[i].x<0 || rects[i].y<0){
            rects[i].width = rects[i].width + Math.min(0,rects[i].x)
            rects[i].x = Math.max(0,rects[i].x)
            rects[i].height = rects[i].height + Math.min(0,rects[i].y)
            rects[i].y = Math.max(0,rects[i].y) 
            setRectangles(rects)
          }
          if(rects[i].x+rects[i].width>image_size[0] || rects[i].y+rects[i].height>image_size[1]){
            rects[i].width = Math.min(rects[i].width,image_size[0] - rects[i].x)
            rects[i].height = Math.min(rects[i].height,image_size[1] - rects[i].y) 
            setRectangles(rects)
          }
          if(rects[i].width<5 || rects[i].height<5){
            rects[i].width = 5
            rects[i].height = 5
          }
      }
      console.log(rects)
    }, [rectangles])
  return (
          <ChakraProvider>
            <Center>
              <HStack>
                <Box width="80%">
                  <Stage  width={window.innerWidth*0.8} height={image_size[1]}
                          onMouseDown={checkDeselect}
                          onMouseMove={(e: any)=>{
                            if(!(adding=== null)){
                            const pointer = e.target.getStage().getPointerPosition()
                            setAdding([adding[0], adding[1], pointer.x, pointer.y])
                          }}}
                          onMouseLeave={(e: any)=>{
                            setAdding(null)
                          }}
                          onMouseUp={(e: any)=>{
                            if(!(adding=== null)){
                              const rects = rectangles.slice();
                              const new_id = Date.now().toString()
                            rects.push({x: adding[0], y: adding[1], width: adding[2]-adding[0], height: adding[3]-adding[1], label: label, stroke: color_map[label], id: new_id})
                            setRectangles(rects);
                            setSelectedId(new_id);
                            setAdding(null)
                          }}}>
                    <Layer x={0} y={0} width={window.innerWidth*0.8} height={image_size[1]}>
                      <Image image={image} />
                    </Layer>
                    <Layer x={0} y={0} width={window.innerWidth*0.8} height={image_size[1]}>
                      {rectangles.map((rect, i) => {
                        return (
                          <BBox
                            key={i}
                            rectProps={rect}
                            mode={mode}
                            isSelected={mode==='Transform' && rect.id === selectedId}
                            onSelect={() => {
                              if(mode==='Transform'){
                              setSelectedId(rect.id);
                              const rects = rectangles.slice();
                              const lastIndex = rects.length - 1;
                              const lastItem = rects[lastIndex];
                              rects[lastIndex] = rects[i];
                              rects[i] = lastItem;
                              setRectangles(rects);
                              setLabel(rect.label)
                            }else if(mode==='Del'){
                              const rects = rectangles.slice();
                              setRectangles(rects.filter((element) => element.id !== rect.id));
                            }
                            }}
                            onChange={(newAttrs:any) => {
                              const rects = rectangles.slice();
                              rects[i] = newAttrs;
                              setRectangles(rects);
                            }}
                          />
                        );
                      })}
                    {adding!==null&&<Rect fill={color_map[label]+'4D'} x={adding[0]} y={adding[1]}width={adding[2]-adding[0]}height={adding[3]-adding[1]}/>}
                    </Layer>
                  </Stage>
                </Box>
                <Spacer />
                <Box>
                  <Select value={mode} onChange={(e)=>{setMode(e.target.value)}}>
                    {['Transform', 'Del'].map(
                      (m) =>
                      <option value={m}>{m}</option>
                      )}
                  </Select>
                  <Select value={label} onChange={handleChange}>
                    {label_list.map(
                      (l) =>
                      <option value={l}>{l}</option>
                      )
                      }
                  </Select>
                  <Button onClick={(e)=>{
                    const currentBboxValue = rectangles.map((rect, i)=>{
                      return{
                        bbox: [rect.x, rect.y, rect.width, rect.height],
                        label_id: label_list.indexOf(rect.label),
                        label: rect.label
                
                      }})
                    Streamlit.setComponentValue(currentBboxValue)}}>Complete</Button>
                </Box>
              </HStack>
            </Center>
          </ChakraProvider>
      )

}


export default withStreamlitConnection(Detection)
