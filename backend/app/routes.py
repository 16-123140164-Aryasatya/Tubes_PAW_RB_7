from pyramid.response import Response

def includeme(config):
    """Configure routes"""
    
    # Authentication routes
    config.add_route('auth_register', '/api/auth/register')
    config.add_route('auth_login', '/api/auth/login')
    config.add_route('auth_me', '/api/auth/me')
    
    # Book routes
    config.add_route('books_list', '/api/books')
    config.add_route('books_detail', '/api/books/{id}')
    config.add_route('books_create', '/api/books/create')
    config.add_route('books_update', '/api/books/{id}/update')
    config.add_route('books_delete', '/api/books/{id}/delete')
    config.add_route('books_search', '/api/books/search')
    
    # Borrowing routes
    config.add_route('borrowings_list', '/api/borrowings')
    config.add_route('borrowings_my', '/api/borrowings/my')
    config.add_route('borrowings_create', '/api/borrowings/borrow')
    config.add_route('borrowings_return', '/api/borrowings/{id}/return')
    config.add_route('borrowings_history', '/api/borrowings/history')

    # Routes for approving or denying borrow requests (librarian actions)
    config.add_route('borrowings_approve', '/api/borrowings/{id}/approve')
    config.add_route('borrowings_deny', '/api/borrowings/{id}/deny')

    # User management routes
    # List all users.  This endpoint is read‑only and does not require authentication
    config.add_route('users_list', '/api/users')
    
    # Root route
    config.add_route('root', '/')
    config.add_view(lambda request: Response('Welcome to the Library API!'), route_name='root')

    # Catch‑all OPTIONS route for CORS preflight.
    # This route matches any path.  We also explicitly register the corresponding
    # view in ``cors.py`` to ensure that Pyramid responds with a 200 OK instead
    # of a 404.  The view simply returns an empty response and the global
    # ``add_cors_headers`` subscriber injects the appropriate headers.
    config.add_route('options', '/{path:.*}')

    # Explicitly register the options view.  Although ``config.scan`` will
    # typically find the decorated view in ``app/views/cors.py``, explicitly
    # adding it here avoids cases where scan misses it.  Importing here
    # locally avoids unnecessary imports when the route is not used.
    from .views.cors import options_view  # noqa: E402
    config.add_view(options_view, route_name='options', request_method='OPTIONS')