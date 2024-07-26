import tempfile

from fastapi import UploadFile


def store_temporary(file: UploadFile):
    tmp = tempfile.NamedTemporaryFile()

    with open(tmp.name, "w") as f:
        while contents := file.file.read(1024 * 1024):
            tmp.write(contents)

    return tmp
