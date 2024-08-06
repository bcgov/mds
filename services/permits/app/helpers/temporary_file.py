import os
import tempfile

from fastapi import UploadFile

FILE_UPLOAD_PATH = os.environ.get("FILE_UPLOAD_PATH", "/file-uploads")

assert FILE_UPLOAD_PATH, "FILE_UPLOAD_PATH is not set in the environment"

def store_temporary(file: UploadFile, suffix: str = "") -> tempfile.NamedTemporaryFile:
    
    tmp = tempfile.NamedTemporaryFile(suffix=suffix, dir=FILE_UPLOAD_PATH, delete=False)

    with open(tmp.name, "w") as f:
        while contents := file.file.read(1024 * 1024):
            tmp.write(contents)

    return tmp
