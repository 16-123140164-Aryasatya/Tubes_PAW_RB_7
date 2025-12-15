from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from . import Base

class Book(Base):
    __tablename__ = 'books'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    copies_total = Column(Integer, nullable=False, default=1)
    copies_available = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=True)
    cover_image = Column(String(255), nullable=True)
    
    # Relationship
    borrowings = relationship('Borrowing', back_populates='book', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert book object to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'category': self.category,
            'copies_total': self.copies_total,
            'copies_available': self.copies_available,
            'description': self.description,
            'cover_image': self.cover_image,
            'is_available': self.copies_available > 0
        }
    
    def is_available_to_borrow(self):
        """Check if book can be borrowed"""
        return self.copies_available > 0
    
    def decrease_available(self):
        """Decrease available copies when borrowed"""
        if self.copies_available > 0:
            self.copies_available -= 1
            return True
        return False
    
    def increase_available(self):
        """Increase available copies when returned"""
        if self.copies_available < self.copies_total:
            self.copies_available += 1
            return True
        return False