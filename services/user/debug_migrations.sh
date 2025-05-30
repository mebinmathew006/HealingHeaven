#!/bin/bash

# Script to debug and fix Alembic migration issues

echo "===== STEP 1: Checking database connection ====="
python -c "
from app.database import DATABASE_URL
print(f'Using database URL: {DATABASE_URL}')
"

echo "===== STEP 2: Checking models detection ====="
python -c "
from app.models import Base
print('Detected tables:')
for table in Base.metadata.tables:
    print(f' - {table}')
"

echo "===== STEP 3: Running Alembic migration ====="
# First create a clean revision
alembic revision --autogenerate -m "create users table"

echo "===== STEP 4: Checking generated migration file ====="
ls -la alembic/versions/
cat alembic/versions/*.py | grep -A 20 "def upgrade"

echo "===== STEP 5: If the migration file looks empty, let's create a manual one ====="
echo "If the 'upgrade()' function is empty in the migration, use:"
echo "alembic revision -m 'manual_create_users_table'"
echo "and manually add the table creation code."