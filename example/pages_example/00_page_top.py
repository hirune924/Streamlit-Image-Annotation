import streamlit as st

st.title("Streamlit Image Annotation - Multipage Example")

st.write("""
This is a multipage example application for Streamlit Image Annotation.

Use the navigation menu to explore different annotation modes:
- **Detection**: Bounding box annotation
- **Classification**: Image classification
- **Point**: Point annotation
- **All Tabs**: All annotation types in tabs

This example verifies that all components work correctly in Streamlit's multipage environment.
""")

st.info("👈 Select a page from the navigation menu to get started!")
