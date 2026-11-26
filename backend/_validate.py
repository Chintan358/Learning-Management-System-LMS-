import sys; sys.path.insert(0, '.')
from app.main import app

schema = app.openapi()
paths = list(schema['paths'].keys())
for p in sorted(paths):
    if 'forgot' in p or 'reset' in p or 'excel' in p or 'health' in p:
        print(f'  FOUND: {p}')

print(f'\nTotal API endpoints: {len(paths)}')
print('All good!')
