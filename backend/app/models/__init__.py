from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from zope.sqlalchemy import register

DBSession = scoped_session(sessionmaker())
register(DBSession)
Base = declarative_base()

# Import all models
from .user import User, UserRole
from .book import Book
from .borrowing import Borrowing

__all__ = ['Base', 'DBSession', 'User', 'UserRole', 'Book', 'Borrowing']