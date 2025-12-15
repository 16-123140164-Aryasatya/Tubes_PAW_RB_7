# File: backend/app/__init__.py
from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from .models import DBSession, Base

def main(global_config, **settings):
    """Main application entry point"""
    
    # Create database engine
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    
    # Create tables if not exist
    Base.metadata.create_all(engine)
    
    # Configure Pyramid
    config = Configurator(settings=settings)
    
    # Enable CORS
    # config.include('pyramid_cors')
    
    # Add routes
    config.include('.routes')
    
    config.scan()
    return config.make_wsgi_app()