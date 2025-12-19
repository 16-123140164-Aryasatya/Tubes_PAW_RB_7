"""
Entry point for running the Pyramid backend in development or production.

This script loads the WSGI application defined in ``backend/app`` via
PasteDeploy and serves it using Waitress.  It honours the ``PORT``
environment variable to allow overriding the default port of 6543.
The application will automatically read its database URL from the
``DATABASE_URL`` environment variable when present; otherwise it falls
back to the ``sqlalchemy.url`` setting in ``development.ini``.  This
design allows seamless deployment to services like Railway (where a
PostgreSQL URL is injected via ``DATABASE_URL``) while still
supporting local development with SQLite.

Usage:

.. code-block:: bash

    cd backend
    python run.py

You can override the port by setting the PORT environment variable:

.. code-block:: bash

    PORT=8000 python run.py

"""

import os
import sys
from waitress import serve
from paste.deploy import loadapp

if __name__ == '__main__':
    # Determine the configuration file.  By default we use
    # ``development.ini`` located in the same directory as this
    # script.  You may specify a different ini via the CONFIG
    # environment variable.
    here = os.path.dirname(__file__)
    config_file = os.environ.get('CONFIG', 'development.ini')
    config_uri = f'config:{config_file}'
    config_path = os.path.join(here, config_file)
    # When the ini file isn't in the current working directory, we
    # supply ``relative_to`` so that PasteDeploy can resolve it.
    app = loadapp(config_uri, relative_to=here)
    # Determine port
    port = int(os.environ.get('PORT', 6543))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f'🏠 Serving Pyramid app on http://{host}:{port} using {config_file}\n')
    # Serve using waitress.  PostgreSQL connections can be shared across
    # multiple threads safely.  You can override the number of worker
    # threads by setting the WAITRESS_THREADS environment variable.
    # Default to 4 threads for reasonable concurrency.
    serve(app, host=host, port=port, threads=int(os.environ.get('WAITRESS_THREADS', '4')))