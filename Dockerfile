# -----------------------------
#   Stage 1 — Base Image
# -----------------------------
FROM python:3.10-slim

# Avoid Python buffering logs
ENV PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Install system dependencies required by SQLAlchemy (PostgreSQL/MySQL)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy full project
COPY . .

# Expose Flask port
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
