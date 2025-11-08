- Using 'uv', a python package and project manager

- It's a tool to easily install venv's, and manage packages (its like npm but for Python)
- Very efficient as well

- Check out the docs for installation/set up: https://docs.astral.sh/uv/
    - You'd just install it globally (as shown in the docs)
    - Then cd to backend folder
    - Then run the following in the terminal: uv sync
        - This will: 
            - Create a virtual environment automatically (.venv)
            - Install all dependencies from pyproject.toml / uv.lock
            - Pin exact versions for reproducibility