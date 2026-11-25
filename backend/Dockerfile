# Multi-stage Dockerfile for FastAPI Backend on Render
FROM python:3.11-slim as base

WORKDIR /app

# Install system dependencies (build-essential, default-libmysqlclient-dev if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Set environment defaults
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run Uvicorn server
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
