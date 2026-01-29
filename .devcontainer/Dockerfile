FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    autoconf \
    build-essential \
    libopenjp2-7 \
    libtiff6 \
    libturbojpeg0-dev \
    tzdata \
    ffmpeg \
    liblapack3 \
    liblapack-dev \
    libatlas-base-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Home Assistant and dependencies
RUN pip install --no-cache-dir \
    homeassistant \
    pytest \
    pytest-asyncio \
    pytest-cov \
    ruff \
    black

# Create config directory
RUN mkdir -p /config/custom_components

WORKDIR /workspaces/ha-inhabit

# Expose Home Assistant port
EXPOSE 8123

CMD ["python", "-m", "homeassistant", "-c", "/config"]
