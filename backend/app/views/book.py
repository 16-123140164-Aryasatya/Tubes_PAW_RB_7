# File: backend/app/views/book.py
from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, Book, User, UserRole
from .auth import get_user_from_token
from sqlalchemy import or_

@view_config(route_name='books_list', request_method='GET', renderer='json')
def list_books(request):
    """Get all books with optional filters"""
    try:
        # Get query parameters
        category = request.params.get('category')
        available_only = request.params.get('available') == 'true'
        
        # Build query
        query = DBSession.query(Book)
        
        if category:
            query = query.filter(Book.category == category)
        
        if available_only:
            query = query.filter(Book.copies_available > 0)
        
        books = query.all()
        
        return Response(
            json={
                'success': True,
                'data': [book.to_dict() for book in books]
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_detail', request_method='GET', renderer='json')
def get_book(request):
    """Get book by ID"""
    try:
        book_id = request.matchdict['id']
        book = DBSession.query(Book).filter_by(id=book_id).first()
        
        if not book:
            return Response(
                json={'success': False, 'message': 'Book not found'},
                status=404
            )
        
        return Response(
            json={
                'success': True,
                'data': book.to_dict()
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_search', request_method='GET', renderer='json')
def search_books(request):
    """Search books by title, author, or category"""
    try:
        search_query = request.params.get('q', '').strip()
        
        if not search_query:
            return Response(
                json={'success': False, 'message': 'Search query is required'},
                status=400
            )
        
        # Search in title, author, and category
        books = DBSession.query(Book).filter(
            or_(
                Book.title.ilike(f'%{search_query}%'),
                Book.author.ilike(f'%{search_query}%'),
                Book.category.ilike(f'%{search_query}%')
            )
        ).all()
        
        return Response(
            json={
                'success': True,
                'data': [book.to_dict() for book in books]
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_create', request_method='POST', renderer='json')
def create_book(request):
    """Create new book (Librarian only)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user or user.role != UserRole.LIBRARIAN:
            return Response(
                json={'success': False, 'message': 'Unauthorized. Librarian access required.'},
                status=403
            )
        
        data = request.json_body
        
        # Validate required fields
        required_fields = ['title', 'author', 'isbn', 'category', 'copies_total']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    json={'success': False, 'message': f'{field} is required'},
                    status=400
                )
        
        # Check if ISBN already exists
        existing_book = DBSession.query(Book).filter_by(isbn=data['isbn']).first()
        if existing_book:
            return Response(
                json={'success': False, 'message': 'Book with this ISBN already exists'},
                status=400
            )
        
        # Create new book
        book = Book(
            title=data['title'],
            author=data['author'],
            isbn=data['isbn'],
            category=data['category'],
            copies_total=data['copies_total'],
            copies_available=data.get('copies_available', data['copies_total']),
            description=data.get('description', ''),
            cover_image=data.get('cover_image', '')
        )
        
        DBSession.add(book)
        DBSession.flush()
        
        return Response(
            json={
                'success': True,
                'message': 'Book created successfully',
                'data': book.to_dict()
            },
            status=201
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_update', request_method='PUT', renderer='json')
def update_book(request):
    """Update book (Librarian only)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user or user.role != UserRole.LIBRARIAN:
            return Response(
                json={'success': False, 'message': 'Unauthorized. Librarian access required.'},
                status=403
            )
        
        book_id = request.matchdict['id']
        book = DBSession.query(Book).filter_by(id=book_id).first()
        
        if not book:
            return Response(
                json={'success': False, 'message': 'Book not found'},
                status=404
            )
        
        data = request.json_body
        
        # Update fields
        if 'title' in data:
            book.title = data['title']
        if 'author' in data:
            book.author = data['author']
        if 'category' in data:
            book.category = data['category']
        if 'copies_total' in data:
            book.copies_total = data['copies_total']
        if 'copies_available' in data:
            book.copies_available = data['copies_available']
        if 'description' in data:
            book.description = data['description']
        if 'cover_image' in data:
            book.cover_image = data['cover_image']
        
        DBSession.flush()
        
        return Response(
            json={
                'success': True,
                'message': 'Book updated successfully',
                'data': book.to_dict()
            },
            status=200
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_delete', request_method='DELETE', renderer='json')
def delete_book(request):
    """Delete book (Librarian only)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user or user.role != UserRole.LIBRARIAN:
            return Response(
                json={'success': False, 'message': 'Unauthorized. Librarian access required.'},
                status=403
            )
        
        book_id = request.matchdict['id']
        book = DBSession.query(Book).filter_by(id=book_id).first()
        
        if not book:
            return Response(
                json={'success': False, 'message': 'Book not found'},
                status=404
            )
        
        # Check if book has active borrowings
        from ..models import Borrowing
        active_borrowings = DBSession.query(Borrowing).filter(
            Borrowing.book_id == book.id,
            Borrowing.return_date == None
        ).count()
        
        if active_borrowings > 0:
            return Response(
                json={'success': False, 'message': 'Cannot delete book with active borrowings'},
                status=400
            )
        
        DBSession.delete(book)
        DBSession.flush()
        
        return Response(
            json={
                'success': True,
                'message': 'Book deleted successfully'
            },
            status=200
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )