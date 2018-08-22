FROM python:3.6

MAINTAINER FreshWorks <web@freshworks.io>

# Update installation utility
RUN apt-get update

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy over the code
COPY . /app

# Run the server
EXPOSE 5000
CMD [ "flask", "run"]