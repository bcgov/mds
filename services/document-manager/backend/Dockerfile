FROM python:3.12.3-bookworm

# Create working directory
WORKDIR /app

# Update installation utility
RUN apt-get update

# Install the requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Run the server
EXPOSE 5001

RUN mkdir -p /tmp/celery

ENTRYPOINT [ "./init.sh" ]