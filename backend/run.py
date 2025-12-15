"""
Simple script to run the development server
"""
from waitress import serve
from pyramid.paster import get_app
import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 6543))
    app = get_app('development.ini')
    print(f'\n🚀 Server running on http://localhost:{port}')
    print(f'📚 Library Management System API')
    print(f'Press CTRL+C to stop\n')
    serve(app, host='0.0.0.0', port=port)