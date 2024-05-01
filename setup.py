import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="streamlit_image_annotation",
    version="0.4.0",
    author="hirune924",
    description="streamlit components for image annotation",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/hirune924/Streamlit-Image-Annotation",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    keywords=['Python', 'Streamlit', 'React', 'JavaScript'],
    python_requires=">=3.6",
    install_requires=[
        "streamlit >= 0.63",
    ],
)