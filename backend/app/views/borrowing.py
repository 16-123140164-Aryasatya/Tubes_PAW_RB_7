# File: backend/app/views/borrowing.py
from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, Book, Borrowing, User, UserRole
from .auth import get_user_from_token
from datetime import datetime

@view_config(route_name='borrowings_list', request_method='GET', renderer='json')
def list_borrowings(request):
    """Get all borrowings (Librarian only)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user or user.role != UserRole.LIBRARIAN:
            return Response(
                json={'success': False, 'message': 'Unauthorized. Librarian access required.'},
                status=403
            )
        
        # Get query parameters
        status = request.params.get('status')  # active, overdue, returned
        
        query = DBSession.query(Borrowing)
        
        if status == 'active':
            query = query.filter(Borrowing.return_date == None)
        elif status == 'returned':
            query = query.filter(Borrowing.return_date != None)
        elif status == 'overdue':
            query = query.filter(
                Borrowing.return_date == None,
                Borrowing.due_date < datetime.now().date()
            )
        
        borrowings = query.order_by(Borrowing.borrow_date.desc()).all()
        
        return Response(
            json={
                'success': True,
                'data': [borrowing.to_dict() for borrowing in borrowings]
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='borrowings_my', request_method='GET', renderer='json')
def my_borrowings(request):
    """Get current user's active borrowings (Member only)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user:
            return Response(
                json={'success': False, 'message': 'Unauthorized'},
                status=401
            )
        
        # Get user's active borrowings (not returned yet)
        borrowings = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.return_date == None
        ).order_by(Borrowing.borrow_date.desc()).all()
        
        return Response(
            json={
                'success': True,
                'data': [borrowing.to_dict() for borrowing in borrowings]
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='borrowings_history', request_method='GET', renderer='json')
def borrowing_history(request):
    """Get borrowing history for current user"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user:
            return Response(
                json={'success': False, 'message': 'Unauthorized'},
                status=401
            )
        
        # Get all borrowings (including returned)
        borrowings = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id
        ).order_by(Borrowing.borrow_date.desc()).all()
        
        return Response(
            json={
                'success': True,
                'data': [borrowing.to_dict() for borrowing in borrowings]
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='borrowings_create', request_method='POST', renderer='json')
def create_borrowing(request):
    """Borrow a book (Member only, max 3 active borrows)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user:
            return Response(
                json={'success': False, 'message': 'Unauthorized'},
                status=401
            )
        
        data = request.json_body
        
        # Validate book_id
        if 'book_id' not in data:
            return Response(
                json={'success': False, 'message': 'book_id is required'},
                status=400
            )
        
        book_id = data['book_id']
        book = DBSession.query(Book).filter_by(id=book_id).first()
        
        if not book:
            return Response(
                json={'success': False, 'message': 'Book not found'},
                status=404
            )
        
        # Check if book is available
        if not book.is_available_to_borrow():
            return Response(
                json={'success': False, 'message': 'Book is not available for borrowing'},
                status=400
            )
        
        # Check if member already has this book borrowed
        existing_borrow = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.book_id == book_id,
            Borrowing.return_date == None
        ).first()
        
        if existing_borrow:
            return Response(
                json={'success': False, 'message': 'You already have this book borrowed'},
                status=400
            )
        
        # Check if member has reached max borrowing limit (3 books)
        active_borrows = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.return_date == None
        ).count()
        
        if active_borrows >= 3:
            return Response(
                json={'success': False, 'message': 'You have reached the maximum borrowing limit (3 books)'},
                status=400
            )
        
        # Create borrowing record
        borrowing = Borrowing(
            book_id=book_id,
            member_id=user.id,
            borrow_date=datetime.now().date()
        )
        
        # Decrease available copies
        book.decrease_available()
        
        DBSession.add(borrowing)
        DBSession.flush()
        
        return Response(
            json={
                'success': True,
                'message': 'Book borrowed successfully',
                'data': borrowing.to_dict()
            },
            status=201
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='borrowings_return', request_method='POST', renderer='json')
def return_book(request):
    """Return a borrowed book (Librarian processes return)"""
    try:
        # Check authentication
        user = get_user_from_token(request)
        if not user:
            return Response(
                json={'success': False, 'message': 'Unauthorized'},
                status=401
            )
        
        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        
        if not borrowing:
            return Response(
                json={'success': False, 'message': 'Borrowing record not found'},
                status=404
            )
        
        # Member can only return their own books, Librarian can process any return
        if user.role != UserRole.LIBRARIAN and borrowing.member_id != user.id:
            return Response(
                json={'success': False, 'message': 'Unauthorized to return this book'},
                status=403
            )
        
        # Check if already returned
        if borrowing.return_date:
            return Response(
                json={'success': False, 'message': 'Book has already been returned'},
                status=400
            )
        
        # Set return date
        borrowing.return_date = datetime.now().date()
        
        # Calculate fine if late
        fine = borrowing.calculate_fine()
        
        # Increase available copies
        borrowing.book.increase_available()
        
        DBSession.flush()
        
        return Response(
            json={
                'success': True,
                'message': 'Book returned successfully',
                'data': {
                    'borrowing': borrowing.to_dict(),
                    'fine': float(fine),
                    'fine_message': f'Late return fine: Rp {fine:,.0f}' if fine > 0 else 'No fine'
                }
            },
            status=200
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )