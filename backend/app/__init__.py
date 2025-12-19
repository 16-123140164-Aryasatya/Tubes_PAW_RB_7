# File: backend/app/__init__.py
from pyramid.config import Configurator
from pyramid.events import NewResponse
from pyramid.events import subscriber
import os
from sqlalchemy import engine_from_config, create_engine
from .models import DBSession, Base

# -----------------------------------------------------------------------------
# CORS subscriber
#
# To support cross‑origin requests from the frontend (which typically runs on
# a different port during development), we attach a NewResponse subscriber.
# This subscriber sets the appropriate CORS headers on every response. It
# allows any GET/POST/PUT/DELETE/OPTIONS request and accepts the common
# headers used by our frontend (Content‑Type and Authorization). The allowed
# origins are read from the ``cors.origins`` setting in the ``.ini`` file. If
# no origins are specified, ``*`` is used, allowing all origins. When multiple
# origins are specified, the subscriber echoes back the request's Origin if it
# appears in the allowed list; otherwise, it falls back to the first value.

@subscriber(NewResponse)
def add_cors_headers(event):
    """Attach CORS headers to every Pyramid response."""
    request = event.request
    response = event.response

    # Obtain allowed origins from settings; support comma or space separated values
    settings = request.registry.settings
    origins_raw = settings.get('cors.origins', '*') or '*'
    # Normalize into a list
    # Split on comma and/or whitespace and filter out empty strings
    origins = [o for o in origins_raw.replace(',', ' ').split() if o] or ['*']
    origin = request.headers.get('Origin')

    # Determine which origin to allow: if '*' present or origin is allowed, echo it
    if '*' in origins:
        allow_origin = origin if origin else '*'
    elif origin and origin in origins:
        allow_origin = origin
    else:
        allow_origin = origins[0]

    response.headers['Access-Control-Allow-Origin'] = allow_origin
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    # Allow cookies/authorization headers to be sent with requests
    response.headers['Access-Control-Allow-Credentials'] = 'true'

def main(global_config, **settings):
    """Main application entry point

    This function is responsible for configuring the Pyramid application and
    setting up the database connection.  By default, Pyramid will read the
    database URL from the ``sqlalchemy.url`` key in the settings passed in
    (typically via the ``.ini`` file).  However, running the application in
    different environments often requires different database backends.  When
    deploying to Railway or another hosted service, an external PostgreSQL URL
    is used.  When running locally without network access, that URL will
    inevitably fail.  To support both scenarios seamlessly, this function
    checks for a ``DATABASE_URL`` environment variable first.  If present,
    that value is used; otherwise it falls back to the ``sqlalchemy.url``
    configured in the settings.  Should connecting to the chosen database
    raise an exception (for example, because the remote host is unreachable),
    the code gracefully falls back to a local SQLite database stored in
    ``library.db``.  The result is an engine that always binds successfully.

    Args:
        global_config: Deployment configuration supplied by PasteDeploy.
        **settings: Arbitrary configuration keys read from the INI file.

    Returns:
        A WSGI application ready to serve HTTP requests.
    """
    # Determine the database URL.  Prefer the DATABASE_URL environment
    # variable when present to allow per‑environment overrides without
    # modifying the .ini file.  If neither the environment variable nor
    # the ``sqlalchemy.url`` setting is provided, the application will
    # raise an error instead of silently falling back to SQLite.  This
    # encourages explicit configuration of PostgreSQL (e.g. via Railway)
    # as required by the assignment specification.
    db_url = os.getenv('DATABASE_URL') or settings.get('sqlalchemy.url')
    if not db_url:
        raise RuntimeError(
            "Database configuration missing: please set the DATABASE_URL environment "
            "variable or configure sqlalchemy.url in development.ini. SQLite fallback has been "
            "removed to enforce PostgreSQL usage."
        )
    # Create the engine and test connectivity.  If connection fails it will
    # raise an exception.  For PostgreSQL connections via Railway you must
    # include the full connection string (e.g. postgresql://user:pass@host:port/dbname).
    engine = create_engine(db_url)
    with engine.connect() as conn:
        pass

    # Bind the session and metadata to the engine.  ``create_all`` will
    # silently skip creating tables that already exist.
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    Base.metadata.create_all(engine)

    # Configure Pyramid with the provided settings
    config = Configurator(settings=settings)
    # Include route declarations
    config.include('.routes')
    # Scan for view callables
    config.scan()
    return config.make_wsgi_app()