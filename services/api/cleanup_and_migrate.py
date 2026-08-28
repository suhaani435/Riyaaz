import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()

raw_url = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres.puudmecclvrffdlctqpj:Saswat3116.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
)

if raw_url.startswith("postgresql://"):
    async_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    async_url = raw_url

print(f"Connecting to database: {async_url.split('@')[-1]}")

async def clean_and_migrate():
    engine = create_async_engine(async_url, echo=True)
    async with engine.begin() as conn:
        print("Checking existing tables...")
        result = await conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            )
        )
        tables = [row[0] for row in result.fetchall()]
        print(f"Existing public tables: {tables}")

        # Drop existing test / rubbish tables if present
        for t in tables:
            print(f"Dropping table {t} CASCADE...")
            await conn.execute(text(f'DROP TABLE IF EXISTS "public"."{t}" CASCADE'))

        print("Creating clean users table and alembic_version...")
        # Create users table matching UserModel
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'student',
                avatar_url VARCHAR(1024),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS ix_users_email ON public.users (email);
            CREATE INDEX IF NOT EXISTS ix_users_role ON public.users (role);
        """)
        )

        # Create alembic_version table
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS public.alembic_version (
                version_num VARCHAR(32) NOT NULL PRIMARY KEY
            );
            DELETE FROM public.alembic_version;
            INSERT INTO public.alembic_version (version_num) VALUES ('0001_create_users_table');
        """)
        )
        print("Database schema successfully cleaned and migrated!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clean_and_migrate())
