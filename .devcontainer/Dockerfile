FROM python:3.12-slim-bookworm

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gcc \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Home Assistant and dev tools
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

EXPOSE 8123

CMD ["python", "-m", "homeassistant", "-c", "/config"]
