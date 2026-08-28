import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Try both direct host and pooler variations
urls = [
    "postgresql+asyncpg://postgres.puudmecclvrffdlctqpj:Saswat3116.@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    "postgresql+asyncpg://postgres.puudmecclvrffdlctqpj:Saswat3116.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    "postgresql+asyncpg://postgres:Saswat3116.@db.puudmecclvrffdlctqpj.supabase.co:5432/postgres",
]

async def test():
    for u in urls:
        print(f"\nTesting URL: {u.split('@')[-1]}")
        try:
            engine = create_async_engine(u, echo=False)
            async with engine.begin() as conn:
                res = await conn.execute(text("SELECT 1"))
                print(f"SUCCESS! Result: {res.scalar()}")
                return u
        except Exception as e:
            print(f"Failed: {e}")
    return None

if __name__ == "__main__":
    asyncio.run(test())
