import streamlit as st

st.set_page_config(page_title="Image Annotation Demo", page_icon="🖼️")

pg = st.navigation([
    st.Page("pages_example/00_page_top.py", title="Home", icon="🏠"),
    st.Page("pages_example/01_page_detection.py", title="Detection", icon="📦"),
    st.Page("pages_example/02_page_classification.py", title="Classification", icon="🏷️"),
    st.Page("pages_example/03_page_point.py", title="Point", icon="📍"),
    st.Page("pages_example/04_page_all_tabs.py", title="All Tabs", icon="📑"),
])

pg.run()
