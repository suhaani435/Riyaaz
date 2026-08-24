from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .init_terms import seed_terms
from .routers import search, feedback, health

settings = get_settings()

app = FastAPI(title="Riyaaz Search & Timestamp API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    seed_terms()


app.include_router(health.router)
app.include_router(search.router)
app.include_router(feedback.router)
