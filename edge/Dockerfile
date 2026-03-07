FROM python:3.11-slim
# Need these for OpenCV
RUN apt-get update && apt-get install -y \
libgl1-mesa-glx \
libglib2.0-0 \
&& rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "producer.py"]
