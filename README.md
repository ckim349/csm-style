# csm-style README

This is a VSCode extension that checks Python style based on "CSM: A Code Style Model for Computing Educators." It uses Ruff, Pylint and Pycodestyle to check a program's style against the NCEA criteria (which includes the whole of PEP8 for level 2 & 3) and provides rationale for each rule, relating them to CSM.

## Usage

Press `F5` to open a new window with your extension loaded. Lines that violate the NCEA criteria will be highlighted in red, and you can hover over them to display a tooltip with the error message. Feel free to use the test_files in this project.

# Setup for Testing Environments

- Install Python 3.10 via https://www.python.org/downloads/release/python-3100/
- Set up a Venv using `python -m venv venv` and activate it
- Alternatively make sure Python extension is installed and use `CTRL+SHIFT+P` and then set up Virtual Environment
- Install all dependencies via `pip install -r requirements.txt
- Make sure that Python, Pylance and Python Debugger are compatible versions for VSCode for v1.94.0 (Make sure they are from 2024 around 8 months ago)
- Run via F5
