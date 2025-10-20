from glob import glob
import os
import streamlit as st
from streamlit_image_annotation import detection

st.title("Detection Annotation")

label_list = ['deer', 'human', 'dog', 'penguin', 'flamingo', 'teddy bear']

# Get images from image directory (parallel to example/)
image_path_list = glob('image/*.jpg')

if not image_path_list:
    st.error("No images found in 'image' directory")
    st.stop()

st.write(f"Found {len(image_path_list)} images")

if 'result_dict_det' not in st.session_state:
    result_dict = {}
    for img in image_path_list:
        result_dict[img] = {'bboxes': [[0,0,100,100],[10,20,50,150]],'labels':[0,3]}
    st.session_state['result_dict_det'] = result_dict.copy()

num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_det')
target_image_path = image_path_list[num_page]

st.write(f"Current image: {os.path.basename(target_image_path)}")

new_labels = detection(image_path=target_image_path,
                  bboxes=st.session_state['result_dict_det'][target_image_path]['bboxes'],
                  labels=st.session_state['result_dict_det'][target_image_path]['labels'],
                  label_list=label_list,
                  line_width=5,
                  use_space=True,
                  key=target_image_path+'_det')

if new_labels is not None:
    st.session_state['result_dict_det'][target_image_path]['bboxes'] = [v['bbox'] for v in new_labels]
    st.session_state['result_dict_det'][target_image_path]['labels'] = [v['label_id'] for v in new_labels]

st.json(st.session_state['result_dict_det'])
