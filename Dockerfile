# Use a lightweight Python base image
FROM python:3.10-slim

# Prevent Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Set work directory inside the container
WORKDIR /app

# Install system dependencies (for some DB drivers, building wheels, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better Docker cache usage)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port your Flask app will run on
EXPOSE 5000

# Run the Flask app
# If your file is not named app.py, change this accordingly
CMD ["python", "app.py"]
