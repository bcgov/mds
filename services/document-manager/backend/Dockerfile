FROM python:3.12.12-bookworm

# Create working directory
WORKDIR /app

# Update installation utility and install SSL/VCS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    git && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install the requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Run the server
EXPOSE 5001

RUN mkdir -p /tmp/celery

ENTRYPOINT [ "./init.sh" ]