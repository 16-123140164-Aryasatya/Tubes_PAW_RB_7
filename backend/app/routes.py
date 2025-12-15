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