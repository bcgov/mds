FROM python:3.6

# Update installation utility
RUN apt-get update

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# RUN celery worker -A app.utils.tasks --concurrency=8 -l info -f celery.log &

# Run the server
EXPOSE 5001
CMD ["flask", "run"]