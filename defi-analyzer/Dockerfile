FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import os; import requests; exit(0 if requests.get(f'http://localhost:{os.environ.get(\"PORT\", \"8000\")}/health').status_code == 200 else 1)"

# Start the service
CMD ["python", "main.py"]
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import os; import requests; exit(0 if requests.get(f'http://localhost:{os.environ.get(\"PORT\", \"8000\")}/health').status_code == 200 else 1)"

# Start the service
CMD ["python", "main.py"]
