"""
Utility views related to CORS handling.

This module defines a single catch‑all OPTIONS handler used to respond to
CORS preflight requests. It returns an empty 200 OK response. Actual CORS
headers are added globally via a subscriber in ``app/__init__.py``.
"""

from pyramid.view import view_config
from pyramid.response import Response


@view_config(route_name='options', request_method='OPTIONS')
def options_view(request):
    """Handle CORS preflight requests.

    Many browsers will perform a preflight OPTIONS request when making
    cross‑origin XHR/fetch calls with JSON payloads. This view simply
    returns a 200 OK response without any body. CORS headers are set via
    a ``NewResponse`` subscriber in the application setup.
    """
    return Response(status=200)