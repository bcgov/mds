FROM python:3.6

# Create working directory
RUN mkdir /app
WORKDIR /app

# # Install the requirements
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the server
EXPOSE 5000
CMD [ "python", "sample.py"]