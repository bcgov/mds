FROM python:3.9

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN apt-get update \
    && apt-get -y install tesseract-ocr # required for pytesseract

ENV TESSDATA_PREFIX /usr/share/tesseract-ocr/5/tessdata

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD ["uvicorn", "app.app:mds", "--reload", "--host", "0.0.0.0", "--port", "80"]
