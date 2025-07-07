FROM python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*
# Set working directory inside container
WORKDIR /app

# Copy only the app folder contents
COPY ./app /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Set PYTHONPATH to ensure imports work cleanly
ENV PYTHONPATH=/app

# Run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]