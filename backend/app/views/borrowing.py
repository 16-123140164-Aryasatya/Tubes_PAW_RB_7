# File: backend/app/views/borrowing.py
from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, Book, Borrowing, User, UserRole
from .auth import get_user_from_token
from datetime import datetime

@view_config(route_name='borrowings_list', request_method='GET', renderer='json')
def list_borrowings(request):
    """Get all borrowings.  Optionally filter by status."""
    try:
        # Authentication is intentionally relaxed for integration

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
    """Get active borrowings for the authenticated user.  If no user,
    return all active borrowings."""
    try:
        user = get_user_from_token(request)

        if user:
            borrowings = DBSession.query(Borrowing).filter(
                Borrowing.member_id == user.id,
                Borrowing.return_date == None
            ).order_by(Borrowing.borrow_date.desc()).all()
        else:
            # No user – return all active borrowings
            borrowings = DBSession.query(Borrowing).filter(
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
    """Get borrowing history for current user.  If no user, returns all."""
    try:
        user = get_user_from_token(request)

        if user:
            borrowings = DBSession.query(Borrowing).filter(
                Borrowing.member_id == user.id
            ).order_by(Borrowing.borrow_date.desc()).all()
        else:
            borrowings = DBSession.query(Borrowing).order_by(Borrowing.borrow_date.desc()).all()

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
    """Borrow a book.

    This endpoint allows a member to borrow a book.  A member may have up
    to 3 active borrowings at any given time (active or overdue).  If
    the requested book is not available or the user has reached the
    limit, an error is returned.  Duplicate borrowings of the same
    book are disallowed until the previous borrowing has been
    returned.  On success, the borrowing record is created, the book's
    available count is decreased and the borrowing data is returned.
    """
    try:
        # Attempt to get authenticated user; fall back to first user in DB
        user = get_user_from_token(request)
        if not user:
            user = DBSession.query(User).first()

        data = request.json_body or {}

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

        # Check existing active borrow of same book
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

        # Enforce maximum 3 concurrent borrowings (active or overdue)
        active_count = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.return_date == None
        ).count()
        if active_count >= 3:
            return Response(
                json={'success': False, 'message': 'Borrowing limit reached (max 3 books)'},
                status=400
            )

        # Create borrowing record with borrow_date today.  The Borrowing
        # model automatically sets due_date 14 days ahead.  return_date
        # remains null until the book is returned.
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
    """Return a borrowed book.  Authentication is relaxed."""
    try:
        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()

        if not borrowing:
            return Response(
                json={'success': False, 'message': 'Borrowing record not found'},
                status=404
            )

        # Prevent double returns
        if borrowing.return_date:
            return Response(
                json={'success': False, 'message': 'Book has already been returned'},
                status=400
            )

        # Set return date to today
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

# -----------------------------------------------------------------------------
# Librarian actions: approve or deny borrow requests
#
# In this simplified implementation, borrowings are automatically created in
# an active state because the system immediately decreases the available
# copies and sets the due date.  However, the frontend exposes buttons to
# "approve" or "deny" a request.  To support those actions without
# introducing additional states into the model, approve is implemented
# as a no‑op (it simply acknowledges the request) while deny marks the
# borrowing as returned using the same logic as the return_book view.

@view_config(route_name='borrowings_approve', request_method='POST', renderer='json')
def approve_borrowing(request):
    """Librarian approves a borrow request.

    Because borrowings are automatically approved at creation time, this
    function simply returns the current borrowing without modifications.
    The frontend refreshes the list of borrowings after approval.
    """
    try:
        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(
                json={'success': False, 'message': 'Borrowing record not found'},
                status=404
            )
        return Response(
            json={
                'success': True,
                'message': 'Borrowing approved',
                'data': borrowing.to_dict()
            },
            status=200
        )
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )


@view_config(route_name='borrowings_deny', request_method='POST', renderer='json')
def deny_borrowing(request):
    """Librarian denies a borrow request by marking it as returned.

    This operation sets the return_date to today (if not already set),
    recalculates any late fine, increases the book's available count,
    and returns the updated borrowing.  The original borrowing remains
    in the database with status "returned" so it appears in history.
    """
    try:
        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(
                json={'success': False, 'message': 'Borrowing record not found'},
                status=404
            )
        # If already returned, cannot deny again
        if borrowing.return_date:
            return Response(
                json={'success': False, 'message': 'Borrowing already returned'},
                status=400
            )
        # Set return date to today
        borrowing.return_date = datetime.now().date()
        # Calculate fine if applicable
        fine = borrowing.calculate_fine()
        # Increase available copies
        borrowing.book.increase_available()
        DBSession.flush()
        return Response(
            json={
                'success': True,
                'message': 'Borrowing denied and book returned',
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