FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install everything in ONE command so pip resolves ALL conflicts together
RUN pip install --no-cache-dir \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    "numpy==1.26.4" \
    "torch==2.2.2+cpu" \
    "torchvision==0.17.2+cpu" \
    "opencv-python-headless==4.8.1.78" \
    "ultralytics==8.2.2" \
    "redis==5.2.1" \
    "pillow" \
    "pyyaml" \
    "tqdm" \
    "psutil" \
    "matplotlib" \
    "scipy" \
    "pandas" \
    "seaborn" \
    "requests"

COPY traffic.mp4.mp4 /app/traffic.mp4.mp4
COPY producer.py /app/producer.py

CMD ["python", "producer.py"]
