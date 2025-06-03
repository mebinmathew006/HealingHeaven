import asyncio
import os
import sys
from logging.config import fileConfig
from sqlalchemy import create_engine 
from sqlalchemy import pool
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from alembic import context
from models.users import Base  # Adjust the import path as needed
from dependencies.database import DATABASE_URL
# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

# Add the parent directory to path if needed to find the models
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))




target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    sync_database_url = DATABASE_URL.replace("asyncpg", "psycopg2")

    context.configure(
        url=sync_database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()



def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    # Use sync URL for Alembic (required!)
    sync_database_url = DATABASE_URL.replace("asyncpg", "psycopg2")

    # Use sync engine for Alembic (even if project uses async)
    connectable = create_engine(sync_database_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())