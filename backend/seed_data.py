"""
Script to seed initial data into database
"""
from app.models import DBSession, User, Book, UserRole, Base
from sqlalchemy import create_engine
from pyramid.paster import get_appsettings
import os
import transaction

def seed_database():
    """Seed database with initial data.

    This function creates a SQLAlchemy engine based on the
    configuration.  It first checks for a ``DATABASE_URL`` environment
    variable (commonly provided by hosting platforms such as Railway)
    and uses that when present.  Otherwise it falls back to the
    ``sqlalchemy.url`` setting in ``development.ini``.  When the
    connection fails it will raise an exception rather than silently
    falling back to SQLite; seed data should only be inserted into the
    intended database.
    """

    # Read settings from the development.ini file
    settings = get_appsettings('development.ini')
    # Prefer DATABASE_URL environment variable
    db_url = os.getenv('DATABASE_URL') or settings.get('sqlalchemy.url')
    engine = create_engine(db_url)
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    Base.metadata.create_all(engine)
    
    with transaction.manager:
        # Check if data already exists
        existing_users = DBSession.query(User).count()
        if existing_users > 0:
            print('⚠️  Database already has data. Skipping seed.')
            return
        
        print('🌱 Seeding database...')
        
        # Create Librarian
        librarian = User(
            name='Admin Librarian',
            email='librarian@library.com',
            role=UserRole.LIBRARIAN
        )
        librarian.set_password('librarian123')
        DBSession.add(librarian)
        
        # Create Members
        members = [
            User(name='John Doe', email='john@example.com', role=UserRole.MEMBER),
            User(name='Jane Smith', email='jane@example.com', role=UserRole.MEMBER),
            User(name='Bob Wilson', email='bob@example.com', role=UserRole.MEMBER),
        ]
        
        for member in members:
            member.set_password('member123')
            DBSession.add(member)
        
        # Create Books
        books_data = [
            {
                'title': 'Clean Code',
                'author': 'Robert C. Martin',
                'isbn': '978-0132350884',
                'category': 'Programming',
                'copies_total': 5,
                'copies_available': 5,
                'description': 'A Handbook of Agile Software Craftsmanship'
            },
            {
                'title': 'The Pragmatic Programmer',
                'author': 'Andrew Hunt',
                'isbn': '978-0135957059',
                'category': 'Programming',
                'copies_total': 3,
                'copies_available': 3,
                'description': 'Your Journey to Mastery'
            },
            {
                'title': 'Introduction to Algorithms',
                'author': 'Thomas H. Cormen',
                'isbn': '978-0262033848',
                'category': 'Computer Science',
                'copies_total': 4,
                'copies_available': 4,
                'description': 'A comprehensive guide to algorithms'
            },
            {
                'title': 'Design Patterns',
                'author': 'Erich Gamma',
                'isbn': '978-0201633610',
                'category': 'Software Engineering',
                'copies_total': 3,
                'copies_available': 3,
                'description': 'Elements of Reusable Object-Oriented Software'
            },
            {
                'title': 'Python Crash Course',
                'author': 'Eric Matthes',
                'isbn': '978-1593279288',
                'category': 'Programming',
                'copies_total': 6,
                'copies_available': 6,
                'description': 'A Hands-On, Project-Based Introduction'
            },
            {
                'title': 'Database System Concepts',
                'author': 'Abraham Silberschatz',
                'isbn': '978-0078022159',
                'category': 'Database',
                'copies_total': 4,
                'copies_available': 4,
                'description': 'Comprehensive database textbook'
            },
            {
                'title': 'Computer Networks',
                'author': 'Andrew S. Tanenbaum',
                'isbn': '978-0132126953',
                'category': 'Networking',
                'copies_total': 3,
                'copies_available': 3,
                'description': 'A comprehensive networking guide'
            },
            {
                'title': 'Artificial Intelligence: A Modern Approach',
                'author': 'Stuart Russell',
                'isbn': '978-0134610993',
                'category': 'Artificial Intelligence',
                'copies_total': 5,
                'copies_available': 5,
                'description': 'The leading textbook in AI'
            },
        ]
        
        for book_data in books_data:
            book = Book(**book_data)
            DBSession.add(book)
        
        print('✅ Database seeded successfully!')
        print('\n📊 Created:')
        print(f'   - 1 Librarian (email: librarian@library.com, password: librarian123)')
        print(f'   - 3 Members (password: member123 for all)')
        print(f'   - 8 Books in various categories')
        
if __name__ == '__main__':
    seed_database()