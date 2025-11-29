<<<<<<< HEAD
# Use an official Python runtime as a base image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000 (Flask's default port)
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Run the application
# --host=0.0.0.0 is required for the container to be accessible from outside
CMD ["flask", "run", "--host=0.0.0.0"]
=======
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "src/server.js"]
>>>>>>> dea774673e1570d06e8162b6ecfbe154a1c1e3ca
