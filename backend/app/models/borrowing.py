from sqlalchemy import Column, Integer, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from . import Base

class Borrowing(Base):
    __tablename__ = 'borrowings'
    
    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey('books.id'), nullable=False)
    member_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    borrow_date = Column(Date, nullable=False, default=datetime.now)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    fine = Column(Numeric(10, 2), default=0.0)
    
    # Relationships
    book = relationship('Book', back_populates='borrowings')
    member = relationship('User', back_populates='borrowings')
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set due date 14 days from borrow date
        if not self.due_date:
            self.due_date = (self.borrow_date or datetime.now()) + timedelta(days=14)
    
    def calculate_fine(self, fine_per_day=5000):
        """Calculate late return fine (Rp 5000 per day)"""
        if self.return_date and self.return_date > self.due_date:
            late_days = (self.return_date - self.due_date).days
            self.fine = late_days * fine_per_day
            return self.fine
        elif not self.return_date and datetime.now().date() > self.due_date:
            # Still not returned and overdue
            late_days = (datetime.now().date() - self.due_date).days
            self.fine = late_days * fine_per_day
            return self.fine
        return 0
    
    def is_overdue(self):
        """Check if borrowing is overdue"""
        if not self.return_date:
            return datetime.now().date() > self.due_date
        return False
    
    def to_dict(self):
        """Convert borrowing object to dictionary"""
        return {
            'id': self.id,
            'book': self.book.to_dict() if self.book else None,
            'member': self.member.to_dict() if self.member else None,
            'borrow_date': self.borrow_date.isoformat() if self.borrow_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'fine': float(self.fine) if self.fine else 0.0,
            'is_overdue': self.is_overdue(),
            'status': 'returned' if self.return_date else ('overdue' if self.is_overdue() else 'active')
        }
