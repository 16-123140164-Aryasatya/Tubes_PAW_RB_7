# File: backend/app/views/borrowing.py
from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, Book, Borrowing, User, UserRole, BorrowStatus
from .auth import get_user_from_token
from datetime import datetime


@view_config(route_name='borrowings_list', request_method='GET', renderer='json')
def list_borrowings(request):
    """Get all borrowings. Optionally filter by status."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)

        status = request.params.get('status')  # pending, active, overdue, returned, denied

        query = DBSession.query(Borrowing)

        # Members only see their own borrowings; librarians see all
        if user.role != UserRole.LIBRARIAN:
            query = query.filter(Borrowing.member_id == user.id)

        if status == 'pending':
            query = query.filter(Borrowing.status == BorrowStatus.PENDING)
        elif status == 'active':
            query = query.filter(Borrowing.status == BorrowStatus.ACTIVE)
        elif status == 'returned':
            query = query.filter(Borrowing.status == BorrowStatus.RETURNED)
        elif status == 'denied':
            query = query.filter(Borrowing.status == BorrowStatus.DENIED)
        elif status == 'overdue':
            query = query.filter(
                Borrowing.status == BorrowStatus.ACTIVE,
                Borrowing.due_date < datetime.now().date()
            )

        borrowings = query.order_by(Borrowing.borrow_date.desc()).all()

        return Response(
            json={'success': True, 'data': [b.to_dict() for b in borrowings]},
            status=200
        )
    except Exception as e:
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_my', request_method='GET', renderer='json')
def my_borrowings(request):
    """Get active/pending borrowings for the authenticated user."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)

        borrowings = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.status.in_([BorrowStatus.PENDING, BorrowStatus.ACTIVE])
        ).order_by(Borrowing.borrow_date.desc()).all()

        return Response(json={'success': True, 'data': [b.to_dict() for b in borrowings]}, status=200)
    except Exception as e:
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_history', request_method='GET', renderer='json')
def borrowing_history(request):
    """Get borrowing history for current user (librarian sees all)."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)

        if user.role == UserRole.LIBRARIAN:
            borrowings = DBSession.query(Borrowing).order_by(Borrowing.borrow_date.desc()).all()
        else:
            borrowings = DBSession.query(Borrowing).filter(
                Borrowing.member_id == user.id
            ).order_by(Borrowing.borrow_date.desc()).all()

        return Response(json={'success': True, 'data': [b.to_dict() for b in borrowings]}, status=200)
    except Exception as e:
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_create', request_method='POST', renderer='json')
def create_borrowing(request):
    """Create a pending borrow request (member or librarian acting as member)."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role not in [UserRole.MEMBER, UserRole.LIBRARIAN]:
            return Response(json={'success': False, 'message': 'Forbidden'}, status=403)

        data = request.json_body or {}
        if 'book_id' not in data:
            return Response(json={'success': False, 'message': 'book_id is required'}, status=400)

        book_id = data['book_id']
        book = DBSession.query(Book).filter_by(id=book_id).first()
        if not book:
            return Response(json={'success': False, 'message': 'Book not found'}, status=404)

        if not book.is_available_to_borrow():
            return Response(json={'success': False, 'message': 'Book is not available for borrowing'}, status=400)

        existing_borrow = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.book_id == book_id,
            Borrowing.status.in_([BorrowStatus.PENDING, BorrowStatus.ACTIVE])
        ).first()
        if existing_borrow:
            return Response(json={'success': False, 'message': 'You already have this book borrowed or pending'}, status=400)

        active_count = DBSession.query(Borrowing).filter(
            Borrowing.member_id == user.id,
            Borrowing.status.in_([BorrowStatus.PENDING, BorrowStatus.ACTIVE])
        ).count()
        if active_count >= 3:
            return Response(json={'success': False, 'message': 'Borrowing limit reached (max 3 books)'}, status=400)

        borrowing = Borrowing(
            book_id=book_id,
            member_id=user.id,
            borrow_date=datetime.now().date(),
            status=BorrowStatus.PENDING
        )

        DBSession.add(borrowing)
        DBSession.flush()
        DBSession.commit()

        return Response(
            json={'success': True, 'message': 'Borrow request created and pending approval', 'data': borrowing.to_dict()},
            status=201
        )
    except Exception as e:
        import traceback
        print("[ERROR] create_borrowing exception:")
        traceback.print_exc()
        DBSession.rollback()
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_return', request_method='POST', renderer='json')
def return_book(request):
    """Request to return an active borrowing. Sets status to PENDING for librarian approval."""
    try:
        user = get_user_from_token(request)
        if not user:
            request.response.status = 401
            return {'success': False, 'message': 'Unauthorized'}

        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            request.response.status = 404
            return {'success': False, 'message': 'Borrowing record not found'}

        if borrowing.status in [BorrowStatus.RETURNED, BorrowStatus.DENIED]:
            request.response.status = 400
            return {'success': False, 'message': 'Borrowing already closed'}
        
        # Member dapat request return saat borrowing ACTIVE, atau librarian saat ACTIVE
        # Jangan allow return request jika sudah pending (menunggu approval untuk borrow)
        if borrowing.status == BorrowStatus.PENDING:
            request.response.status = 400
            return {'success': False, 'message': 'Borrowing is pending approval - cannot request return yet'}

        if user.role != UserRole.LIBRARIAN and borrowing.member_id != user.id:
            request.response.status = 403
            return {'success': False, 'message': 'Forbidden'}

        # Set status to PENDING untuk menandakan return sedang menunggu approval librarian
        # Tandai tanggal return sekarang agar bisa dibedakan dari borrow pending
        # dan untuk perhitungan denda menggunakan tanggal request.
        borrowing.status = BorrowStatus.PENDING
        borrowing.return_date = datetime.now().date()

        DBSession.flush()
        DBSession.commit()

        return {
            'success': True,
            'message': 'Return request submitted, awaiting librarian approval',
            'data': {
                'borrowing': borrowing.to_dict()
            }
        }
    except Exception as e:
        DBSession.rollback()
        request.response.status = 500
        return {'success': False, 'message': str(e)}


@view_config(route_name='borrowings_approve', request_method='POST', renderer='json')
def approve_borrowing(request):
    """Librarian approves a pending borrow request and activates it."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(json={'success': False, 'message': 'Borrowing record not found'}, status=404)

        if borrowing.status == BorrowStatus.RETURNED:
            return Response(json={'success': False, 'message': 'Borrowing already returned'}, status=400)
        if borrowing.status == BorrowStatus.DENIED:
            return Response(json={'success': False, 'message': 'Borrowing has been denied'}, status=400)
        if borrowing.status == BorrowStatus.ACTIVE:
            return Response(json={'success': False, 'message': 'Borrowing already approved'}, status=400)

        if not borrowing.book.is_available_to_borrow():
            return Response(json={'success': False, 'message': 'No available copies to approve'}, status=400)

        borrowing.status = BorrowStatus.ACTIVE
        borrowing.return_date = None
        borrowing.borrow_date = borrowing.borrow_date or datetime.now().date()
        borrowing.book.decrease_available()

        DBSession.flush()
        DBSession.commit()

        return Response(json={'success': True, 'message': 'Borrowing approved and activated', 'data': borrowing.to_dict()}, status=200)
    except Exception as e:
        DBSession.rollback()
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_deny', request_method='POST', renderer='json')
def deny_borrowing(request):
    """Librarian denies a pending borrow request."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(json={'success': False, 'message': 'Borrowing record not found'}, status=404)

        if borrowing.status == BorrowStatus.RETURNED:
            return Response(json={'success': False, 'message': 'Borrowing already returned'}, status=400)
        if borrowing.status == BorrowStatus.DENIED:
            return Response(json={'success': False, 'message': 'Borrowing already denied'}, status=400)
        if borrowing.status == BorrowStatus.ACTIVE:
            borrowing.book.increase_available()
            borrowing.return_date = datetime.now().date()

        borrowing.status = BorrowStatus.DENIED

        DBSession.flush()
        DBSession.commit()

        return Response(json={'success': True, 'message': 'Borrowing denied', 'data': borrowing.to_dict()}, status=200)
    except Exception as e:
        DBSession.rollback()
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_approve_return', request_method='POST', renderer='json')
def approve_return(request):
    """Librarian approves a return request, marks borrowing as RETURNED and calculates fine."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(json={'success': False, 'message': 'Borrowing record not found'}, status=404)

        # Hanya approve return jika status PENDING (return request pending)
        # dan borrowing original statusnya ACTIVE (bukan borrow request pending)
        # Tapi karena sekarang PENDING bisa borrow/return, kita harus track di client
        # Untuk sekarang, asumsi return request hanya bisa dari ACTIVE borrowings
        if borrowing.status != BorrowStatus.PENDING:
            return Response(json={'success': False, 'message': 'No pending return request for this borrowing'}, status=400)

        # Set return_date dan calculate fine
        borrowing.return_date = datetime.now().date()
        borrowing.status = BorrowStatus.RETURNED
        fine = borrowing.calculate_fine()
        borrowing.book.increase_available()

        DBSession.flush()
        DBSession.commit()

        return Response(
            json={
                'success': True,
                'message': 'Return approved, borrowing marked as returned',
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
        return Response(json={'success': False, 'message': str(e)}, status=500)


@view_config(route_name='borrowings_deny_return', request_method='POST', renderer='json')
def deny_return(request):
    """Librarian denies a return request, sets borrowing back to ACTIVE."""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response(json={'success': False, 'message': 'Unauthorized'}, status=401)
        if user.role != UserRole.LIBRARIAN:
            return Response(json={'success': False, 'message': 'Forbidden: librarian only'}, status=403)

        borrowing_id = request.matchdict['id']
        borrowing = DBSession.query(Borrowing).filter_by(id=borrowing_id).first()
        if not borrowing:
            return Response(json={'success': False, 'message': 'Borrowing record not found'}, status=404)

        if borrowing.status != BorrowStatus.PENDING:
            return Response(json={'success': False, 'message': 'No pending return request for this borrowing'}, status=400)

        # Set kembali ke ACTIVE dan hapus tanggal return (karena request ditolak)
        borrowing.status = BorrowStatus.ACTIVE
        borrowing.return_date = None

        DBSession.flush()
        DBSession.commit()

        return Response(json={'success': True, 'message': 'Return request denied, borrowing set to active', 'data': borrowing.to_dict()}, status=200)
    except Exception as e:
        DBSession.rollback()
        return Response(json={'success': False, 'message': str(e)}, status=500)

