FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd --system riyaaz \
    && useradd --system --gid riyaaz --create-home riyaaz

COPY services/api/pyproject.toml ./
COPY services/api/src ./src

RUN pip install --no-cache-dir .

USER riyaaz

EXPOSE 8000

CMD ["uvicorn", "riyaaz_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
