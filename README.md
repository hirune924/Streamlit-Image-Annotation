# Streamlit Image Annotation

Streamlit component for image annotation.

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://st-image-annotation.streamlit.app/)
[![PyPI](https://img.shields.io/pypi/v/streamlit-image-annotation)](https://pypi.org/project/streamlit-image-annotation/)
![](./image/demo.gif)
# Features
* You can easily launch an image annotation tool using streamlit.
* By customizing the pre- and post-processing, you can achieve your preferred annotation workflow.
* Currently supports classification, detection, point detection tasks.
* Simple UI that is easy to navigate.

# Install

```sh
pip install streamlit-image-annotation
```

# Example Usage
If you want to see other use cases, please check inside the examples folder.

```python
from glob import glob
import pandas as pd
import streamlit as st
from streamlit_image_annotation import classification

label_list = ['deer', 'human', 'dog', 'penguin', 'framingo', 'teddy bear']
image_path_list = glob('image/*.jpg')
if 'result_df' not in st.session_state:
    st.session_state['result_df'] = pd.DataFrame.from_dict({'image': image_path_list, 'label': [0]*len(image_path_list)}).copy()

num_page = st.slider('page', 0, len(image_path_list)-1, 0)
label = classification(image_path_list[num_page], 
                        label_list=label_list, 
                        default_label_index=int(st.session_state['result_df'].loc[num_page, 'label']))

if label is not None and label['label'] != st.session_state['result_df'].loc[num_page, 'label']:
    st.session_state['result_df'].loc[num_page, 'label'] = label_list.index(label['label'])
st.table(st.session_state['result_df'])
```

# API

```python
classification(
    image_path: str,
    label_list: List[str],
    default_label_index: Optional[int] = None,
    height: int = 512,
    width: int = 512,
    key: Optional[str] = None
)
```

- **image_path**: Image path.
- **label_list**: List of label candidates.
- **default_label_index**: Initial label index.
- **height**: The maximum height of the displayed image.
- **width**: The maximum width of the displayed image.
- **key**: An optional string to use as the unique key for the widget. Assign a key so the component is not remount every time the script is rerun.

- **Component Value**: {'label': label_name}

Example: [example code](example/classification.py)

```python
detection(
    image_path: str,
    label_list: List[str],
    bboxes: Optional[List[List[int, int, int, int]]] = None,
    labels: Optional[List[int]] = None,
    height: int = 512,
    width: int = 512,
    line_width: int = 5,
    use_space: bool = False,
    key: Optional[str] = None
)
```

- **image_path**: Image path.
- **label_list**: List of label candidates.
- **bboxes**: Initial list of bounding boxes, where each bbox is in the format [x, y, w, h].
- **labels**: List of label for each initial bbox.
- **height**: The maximum height of the displayed image.
- **width**: The maximum width of the displayed image.
- **line_width**: The stroke width of the bbox.
- **use_space**: Enable Space key for complete.
- **key**: An optional string to use as the unique key for the widget. Assign a key so the component is not remount every time the script is rerun.

- **Component Value**: \[{'bbox':[x,y,width, height], 'label_id': label_id, 'label': label_name},...\]

Example: [example code](example/detection.py)

```python
pointdet(
    image_path: str,
    label_list: List[str],
    points: Optional[List[List[int, int]]] = None,
    labels: Optional[List[int]] = None,
    height: int = 512,
    width: int = 512,
    point_width: int =3,
    use_space: bool = False,
    key: Optional[str] = None
)
```

- **image_path**: Image path.
- **label_list**: List of label candidates.
- **points**: Initial list of points, where each point is in the format [x, y].
- **labels**: List of label for each initial bbox.
- **height**: The maximum height of the displayed image.
- **width**: The maximum width of the displayed image.
- **point_width**: The stroke width of the bbox.
- **use_space**: Enable Space key for complete.
- **key**: An optional string to use as the unique key for the widget. Assign a key so the component is not remount every time the script is rerun.

- **Component Value**: \[{'bbox':[x,y], 'label_id': label_id, 'label': label_name},...\]

Example: [example code](example/pointdet.py)

# Future Work
* Addition of component for segmentation task.

# Development
## setup
```bash
cd Streamlit-Image-Annotation/
export PYTHONPATH=$PWD
```
and set `IS_RELEASE = False` in `Streamlit-Image-Annotation/__init__.py`.


## start frontend
```bash
git clone https://github.com/hirune924/Streamlit-Image-Annotation.git
cd Streamlit-Image-Annotation/streamlit_image_annotation/Detection/frontend
yarn
yarn start
```

## start streamlit
```bash
cd Streamlit-Image-Annotation/
streamlit run streamlit_image_annotation/Detection/__init__.py
```

## build
You can use the automated build script to build all components and create the distribution package:

```bash
source .venv/bin/activate  # Activate virtual environment first
./scripts/build_all.sh
```

This script will:
1. Clean previous builds
2. Build all three frontend components (Classification, Detection, Point)
3. Create both wheel and source distribution packages in `dist/` folder

The built package can be found in `dist/streamlit_image_annotation-*.whl`.

Alternatively, you can build manually:
```bash
cd Streamlit-Image-Annotation/Classification/frontend
yarn build
cd Streamlit-Image-Annotation/Detection/frontend
yarn build
cd Streamlit-Image-Annotation/Point/frontend
yarn build
```
and set `IS_RELEASE = True` in `Streamlit-Image-Annotation/__init__.py`.

Then create the wheel:
```bash
python setup.py sdist bdist_wheel
```
## upload
```bash
python3 -m twine upload --repository testpypi dist/*
python -m pip install --index-url https://test.pypi.org/simple/ --no-deps streamlit-image-annotation
```
```bash
twine upload dist/*
```
