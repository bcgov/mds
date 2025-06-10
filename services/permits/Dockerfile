FROM python:3.13.4-slim

WORKDIR /code

COPY . /code

RUN pip install --no-cache-dir -r /code/requirements.txt

CMD ["uvicorn", "app.app:mds", "--reload", "--host", "0.0.0.0", "--port", "80"]
