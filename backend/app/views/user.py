"""
Views for user management.  This file exposes a simple endpoint
to list all registered users.  Authentication is intentionally
relaxed for integration purposes, but in a real application you
should restrict this to librarians or administrators.

Routes are registered in ``app/routes.py``.  See that file for
route names and paths.
"""

from pyramid.view import view_config
from pyramid.response import Response

from ..models import DBSession, User


@view_config(route_name='users_list', request_method='GET', renderer='json')
def list_users(request):
    """Return a list of all users.

    In this demo implementation the endpoint is accessible without
    authentication.  The response contains a ``data`` field with
    an array of user objects obtained from ``User.to_dict()``.
    """
    try:
        users = DBSession.query(User).order_by(User.id).all()
        return Response(
            json={
                'success': True,
                'data': [u.to_dict() for u in users]
            },
            status=200
        )
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )