import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from infra.db.base import Base  # import your Base here
from domain.models import user  # make sure all models are imported
import os
from dotenv import load_dotenv

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

load_dotenv()  # Load .env file from the project root (or specify path)

DATABASE_URL = config.get_main_option("sqlalchemy.url") or os.getenv("USER_DATABASE_URL")

print("Alembic DATABASE_URL:", DATABASE_URL)

def do_run_migrations(connection: Connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(DATABASE_URL, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

asyncio.run(run_migrations_online())
