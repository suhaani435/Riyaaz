import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

local_url = "postgresql+asyncpg://riyaaz:replace_with_a_local_secret@localhost:5433/riyaaz"

statements = [
    """
    CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        avatar_url VARCHAR(1024),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_users_email ON public.users (email)",
    "CREATE INDEX IF NOT EXISTS ix_users_role ON public.users (role)",
    """
    CREATE TABLE IF NOT EXISTS public.alembic_version (
        version_num VARCHAR(32) NOT NULL PRIMARY KEY
    )
    """,
    "DELETE FROM public.alembic_version",
    "INSERT INTO public.alembic_version (version_num) VALUES ('0001_create_users_table')",
]

async def init_local_db():
    print(f"Connecting to local Docker database at {local_url}...")
    engine = create_async_engine(local_url, echo=False)
    async with engine.begin() as conn:
        for stmt in statements:
            await conn.execute(text(stmt))
        print("Local Docker database initialized successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_local_db())
