FROM python:3.6

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Run the server
EXPOSE 5500
CMD ["flask","db","upgrade"]