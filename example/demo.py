import streamlit as st
from glob import glob
import pandas as pd
from streamlit_image_annotation import detection, classification, pointdet

mode = st.tabs(["Detection", "Classification", "Point"])
label_list = ['deer', 'human', 'dog', 'penguin', 'framingo', 'teddy bear']
image_path_list = glob('image/*.jpg')

with mode[0]:
    if 'result_dict_det' not in st.session_state:
        result_dict = {}
        for img in image_path_list:
            result_dict[img] = {'bboxes': [[0,0,100,100],[10,20,50,150]],'labels':[0,3]}
        st.session_state['result_dict_det'] = result_dict.copy()

    num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_det')
    target_image_path = image_path_list[num_page]

    new_labels = detection(image_path=target_image_path, 
                        bboxes=st.session_state['result_dict_det'][target_image_path]['bboxes'], 
                        labels=st.session_state['result_dict_det'][target_image_path]['labels'], 
                        label_list=label_list, use_space=True, key=target_image_path+'_det')
    if new_labels is not None:
        st.session_state['result_dict_det'][target_image_path]['bboxes'] = [v['bbox'] for v in new_labels]
        st.session_state['result_dict_det'][target_image_path]['labels'] = [v['label_id'] for v in new_labels]
    st.json(st.session_state['result_dict_det'])

with mode[1]:

    if 'result_df_cls' not in st.session_state:
        st.session_state['result_df_cls'] = pd.DataFrame.from_dict({'image': image_path_list, 'label': [0]*len(image_path_list)}).copy()

    num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_cls')

    label = classification(image_path_list[num_page], 
                            label_list=label_list, 
                            default_label_index=int(st.session_state['result_df_cls'].loc[num_page, 'label']))

    if label is not None and label['label'] != st.session_state['result_df_cls'].loc[num_page, 'label']:
        st.session_state['result_df_cls'].loc[num_page, 'label'] = label_list.index(label['label'])
    st.table(st.session_state['result_df_cls'])

with mode[2]:

    if 'result_dict_point' not in st.session_state:
        result_dict = {}
        for img in image_path_list:
            result_dict[img] = {'points': [[0,0],[50,150], [200,200]],'labels':[0,3,4]}
        st.session_state['result_dict_point'] = result_dict.copy()

    num_page = st.slider('page', 0, len(image_path_list)-1, 0, key='slider_point')
    target_image_path = image_path_list[num_page]

    new_labels = pointdet(image_path=target_image_path, 
                            label_list=label_list, 
                            points=st.session_state['result_dict_point'][target_image_path]['points'],
                            labels=st.session_state['result_dict_point'][target_image_path]['labels'],
                            use_space=True, key=target_image_path+'_point')
    if new_labels is not None:
        st.session_state['result_dict_point'][target_image_path]['points'] = [v['point'] for v in new_labels]
        st.session_state['result_dict_point'][target_image_path]['labels'] = [v['label_id'] for v in new_labels]
    st.json(st.session_state['result_dict_point'])