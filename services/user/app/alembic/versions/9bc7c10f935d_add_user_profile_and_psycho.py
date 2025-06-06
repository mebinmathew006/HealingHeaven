"""add user_profile and psycho

Revision ID: 9bc7c10f935d
Revises: f4d24ddf7416
Create Date: 2025-05-21 17:52:06.396354

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9bc7c10f935d'
down_revision: Union[str, None] = 'f4d24ddf7416'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('psychologist_profile',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('profile_image', sa.Text(), nullable=True),
    sa.Column('date_of_birth', sa.Date(), nullable=True),
    sa.Column('gender', sa.String(length=10), nullable=True),
    sa.Column('about_me', sa.Text(), nullable=True),
    sa.Column('qualification', sa.String(length=255), nullable=True),
    sa.Column('experience', sa.Integer(), nullable=True),
    sa.Column('specialization', sa.String(length=255), nullable=True),
    sa.Column('fees', sa.Integer(), nullable=True),
    sa.Column('identification_doc', sa.Text(), nullable=True),
    sa.Column('education_certificate', sa.Text(), nullable=True),
    sa.Column('experience_certificate', sa.Text(), nullable=True),
    sa.Column('is_verified', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
    sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_psychologist_profile_id'), 'psychologist_profile', ['id'], unique=False)
    op.create_table('user_profile',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('profile_image', sa.Text(), nullable=True),
    sa.Column('date_of_birth', sa.Date(), nullable=True),
    sa.Column('gender', sa.String(length=10), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_profile_id'), 'user_profile', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_user_profile_id'), table_name='user_profile')
    op.drop_table('user_profile')
    op.drop_index(op.f('ix_psychologist_profile_id'), table_name='psychologist_profile')
    op.drop_table('psychologist_profile')
    # ### end Alembic commands ###
