from glob import glob
import os
import streamlit as st
import pandas as pd
from streamlit_image_annotation import classification

st.title("Classification Annotation")

label_list = ['deer', 'human', 'dog', 'penguin', 'flamingo', 'teddy bear']

# Get images from image directory (parallel to example/)
image_path_list = glob('image/*.jpg')

if not image_path_list:
    st.error("No images found in 'image' directory")
    st.stop()

st.write(f"Found {len(image_path_list)} images")

if 'result_df_cls' not in st.session_state:
    st.session_state['result_df_cls'] = pd.DataFrame.from_dict({
        'image': image_path_list,
        'label': [0]*len(image_path_list)
    }).copy()

num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_cls')

st.write(f"Current image: {os.path.basename(image_path_list[num_page])}")

label = classification(image_path_list[num_page],
                        label_list=label_list,
                        default_label_index=int(st.session_state['result_df_cls'].loc[num_page, 'label']),
                        key='cls_'+str(num_page))

if label is not None and label['label'] != st.session_state['result_df_cls'].loc[num_page, 'label']:
    st.session_state['result_df_cls'].loc[num_page, 'label'] = label_list.index(label['label'])

st.table(st.session_state['result_df_cls'])
