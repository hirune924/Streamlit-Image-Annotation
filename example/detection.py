import streamlit as st
from glob import glob
from streamlit_image_annotation import detection

label_list = ['deer', 'human', 'dog', 'penguin', 'framingo', 'teddy bear']
image_path_list = glob('image/*.jpg')
if 'result_dict' not in st.session_state:
    result_dict = {}
    for img in image_path_list:
        result_dict[img] = {'bboxes': [[0,0,100,100],[10,20,50,150]],'labels':[0,3]}
    st.session_state['result_dict'] = result_dict.copy()

num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider')
target_image_path = image_path_list[num_page]

new_labels = detection(image_path=target_image_path, 
                    bboxes=st.session_state['result_dict'][target_image_path]['bboxes'], 
                    labels=st.session_state['result_dict'][target_image_path]['labels'], 
                    label_list=label_list, use_space=True, key=target_image_path)
if new_labels is not None:
    st.session_state['result_dict'][target_image_path]['bboxes'] = [v['bbox'] for v in new_labels]
    st.session_state['result_dict'][target_image_path]['labels'] = [v['label_id'] for v in new_labels]
st.json(st.session_state['result_dict'])