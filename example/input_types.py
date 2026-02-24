"""Issue #13: np.ndarray / PIL.Image 入力のテスト"""
import streamlit as st
import numpy as np
from PIL import Image
from streamlit_image_annotation import classification, detection, pointdet

image_path = 'image/deer.jpg'
pil_image = Image.open(image_path)
ndarray_image = np.array(pil_image)

label_list = ['deer', 'human', 'dog']
bboxes = [[0, 0, 100, 100]]
labels = [0]
points = [[50, 50]]

st.header("Detection")
col1, col2, col3 = st.columns(3)
with col1:
    st.subheader("str")
    detection(image_path=image_path, bboxes=bboxes, labels=labels, label_list=label_list, key="det_str")
with col2:
    st.subheader("PIL.Image")
    detection(image_path=pil_image, bboxes=bboxes, labels=labels, label_list=label_list, key="det_pil")
with col3:
    st.subheader("np.ndarray")
    detection(image_path=ndarray_image, bboxes=bboxes, labels=labels, label_list=label_list, key="det_np")

st.header("Classification")
col1, col2, col3 = st.columns(3)
with col1:
    st.subheader("str")
    classification(image_path=image_path, label_list=label_list, key="cls_str")
with col2:
    st.subheader("PIL.Image")
    classification(image_path=pil_image, label_list=label_list, key="cls_pil")
with col3:
    st.subheader("np.ndarray")
    classification(image_path=ndarray_image, label_list=label_list, key="cls_np")

st.header("Point Detection")
col1, col2, col3 = st.columns(3)
with col1:
    st.subheader("str")
    pointdet(image_path=image_path, points=points, labels=labels, label_list=label_list, key="pt_str")
with col2:
    st.subheader("PIL.Image")
    pointdet(image_path=pil_image, points=points, labels=labels, label_list=label_list, key="pt_pil")
with col3:
    st.subheader("np.ndarray")
    pointdet(image_path=ndarray_image, points=points, labels=labels, label_list=label_list, key="pt_np")
