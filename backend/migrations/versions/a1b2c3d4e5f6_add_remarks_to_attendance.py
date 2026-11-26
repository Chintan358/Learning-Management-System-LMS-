"""Add remarks column to attendance table

Revision ID: a1b2c3d4e5f6
Revises: 6bd14c63cbf3
Create Date: 2026-11-26 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '6bd14c63cbf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add remarks column to attendance table (nullable, so existing rows are unaffected)
    op.add_column(
        'attendance',
        sa.Column('remarks', sa.String(length=500), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('attendance', 'remarks')
