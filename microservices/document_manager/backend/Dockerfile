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

#set entrypoint to ex.
RUN chmod u+x ./dev-entrypoint.sh


# Run the server
EXPOSE 5001