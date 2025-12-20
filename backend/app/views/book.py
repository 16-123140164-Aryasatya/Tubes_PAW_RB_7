# File: backend/app/views/book.py
from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, Book, User, UserRole
from .auth import get_user_from_token
from sqlalchemy import or_
import random
from datetime import datetime

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
        # NOTE: Authentication check is intentionally relaxed to simplify integration
        # with the fro        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        data = request.json_body or {}

        # Validate minimal required fields
        required_fields = ['title', 'author']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    json={'success': False, 'message': f'{field} is required'},
                    status=400
                )

        # Generate or use provided ISBN
        isbn = data.get('isbn')
        if not isbn:
            # Create a pseudo‑random ISBN using timestamp and random digits
            timestamp = int(datetime.utcnow().timestamp())
            isbn = f"ISBN-{timestamp}-{random.randint(1000, 9999)}"

        # If ISBN exists in DB, append suffix to avoid duplicate constraint
        existing_book = DBSession.query(Book).filter_by(isbn=isbn).first()
        if existing_book:
            isbn = f"{isbn}-{random.randint(1000, 9999)}"

        # Derive category and copy counts with sensible defaults
        category = data.get('category', 'General') or 'General'
        # Determine total copies: prefer copies_total, else copies_available, else 1
        copies_total = data.get('copies_total') or data.get('copies_available') or 1
        try:
            copies_total = int(copies_total)
        except Exception:
            copies_total = 1
        # Determine available copies: prefer copies_available, else use total
        copies_available = data.get('copies_available') or copies_total
        try:
            copies_available = int(copies_available)
        except Exception:
            copies_available = copies_total

        description = data.get('description', '') or ''
        cover_image = data.get('cover_image', '') or ''

        # Create new book instance
        book = Book(
            title=data['title'],
            author=data['author'],
            isbn=isbn,
            category=category,
            copies_total=copies_total,
            copies_available=copies_available,
            description=description,
            cover_image=cover_image
        )

        DBSession.add(book)
        # Persist the new book immediately.  ``flush`` writes the
        # pending changes to the database but does not commit the
        # transaction.  Without an explicit commit here (or a transaction
        # manager such as ``pyramid_tm``) the new record would only be
        # visible within this request and would be rolled back at the
        # end.  Committing after a successful flush ensures the book is
        # saved to the PostgreSQL database and available on subsequent
        # requests.
        DBSession.flush()
        DBSession.commit()

        return Response(
            json={
                'success': True,
                'message': 'Book created successfully',
                'data': book.to_dict()
            },
            status=201
        )
        
    except Exception as e:
        import traceback
        print("[ERROR] create_book exception:")
        traceback.print_exc()
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='books_update', request_method='PUT', renderer='json')
def update_book(request):
    """Update book (Librarian only)"""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        book_id = request.matchdict['id']
        book = DBSession.query(Book).filter_by(id=book_id).first()

        if not book:
            return Response(
                json={'success': False, 'message': 'Book not found'},
                status=404
            )

        data = request.json_body or {}

        # Update simple string fields if provided
        if 'title' in data and data['title']:
            book.title = data['title']
        if 'author' in data and data['author']:
            book.author = data['author']
        if 'category' in data and data['category']:
            book.category = data['category']
        if 'description' in data:
            book.description = data.get('description') or ''
        if 'cover_image' in data:
            book.cover_image = data.get('cover_image') or ''
        # Update copy counts if provided
        if 'copies_total' in data and data['copies_total'] is not None:
            try:
                book.copies_total = int(data['copies_total'])
            except Exception:
                pass
        if 'copies_available' in data and data['copies_available'] is not None:
            try:
                book.copies_available = int(data['copies_available'])
            except Exception:
                pass
        # Allow updating ISBN if provided and non‑empty
        if 'isbn' in data and data['isbn']:
            new_isbn = data['isbn']
            # Avoid duplicate constraint: if other book has same ISBN, append suffix
            existing = DBSession.query(Book).filter(Book.isbn == new_isbn, Book.id != book.id).first()
            if existing:
                new_isbn = f"{new_isbn}-{random.randint(1000, 9999)}"
            book.isbn = new_isbn

        DBSession.flush()
        DBSession.commit()

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
    """Delete book (any user).  Active borrowings are still protected."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)
    )

        # Do not delete if there are active borrowings
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
        # Flush and commit the deletion.  Without committing, the
        # deletion would remain pending and the book would still be
        # visible in other sessions.  Committing ensures the record is
        # removed permanently from the database.
        DBSession.flush()
        DBSession.commit()

        return Response(
            json={
                'success': True,
                'message': 'Book deleted successfully'
            },
            status=200
        )

    except Exception as e:
        import traceback
        print("[ERROR] delete_book exception:")
        traceback.print_exc()
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )
