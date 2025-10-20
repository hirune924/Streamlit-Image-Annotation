from glob import glob
import os
import streamlit as st
from streamlit_image_annotation import pointdet

st.title("Point Annotation")

label_list = ['deer', 'human', 'dog', 'penguin', 'flamingo', 'teddy bear']

# Get images from image directory (parallel to example/)
image_path_list = glob('image/*.jpg')

if not image_path_list:
    st.error("No images found in 'image' directory")
    st.stop()

st.write(f"Found {len(image_path_list)} images")

if 'result_dict_point' not in st.session_state:
    result_dict = {}
    for img in image_path_list:
        result_dict[img] = {'points': [[0,0],[50,150], [200,200]],'labels':[0,3,4]}
    st.session_state['result_dict_point'] = result_dict.copy()

num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_point')
target_image_path = image_path_list[num_page]

st.write(f"Current image: {os.path.basename(target_image_path)}")

new_labels = pointdet(image_path=target_image_path,
                        label_list=label_list,
                        points=st.session_state['result_dict_point'][target_image_path]['points'],
                        labels=st.session_state['result_dict_point'][target_image_path]['labels'],
                        point_width=3,
                        use_space=True,
                        key=target_image_path+'_point')

if new_labels is not None:
    st.session_state['result_dict_point'][target_image_path]['points'] = [v['point'] for v in new_labels]
    st.session_state['result_dict_point'][target_image_path]['labels'] = [v['label_id'] for v in new_labels]

st.json(st.session_state['result_dict_point'])
