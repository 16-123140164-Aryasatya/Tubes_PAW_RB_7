from pyramid.view import view_config
from pyramid.response import Response
from ..models import DBSession, User, UserRole
import jwt
from datetime import datetime, timedelta
import json

def create_token(user_id, secret):
    """Create JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def get_user_from_token(request):
    """Get user from JWT token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, request.registry.settings['jwt.secret'], algorithms=['HS256'])
        user = DBSession.query(User).filter_by(id=payload['user_id']).first()
        return user
    except:
        return None

@view_config(route_name='auth_register', request_method='POST', renderer='json')
def register(request):
    """Register new user"""
    try:
        data = request.json_body
        
        # Validate input
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    json={'success': False, 'message': f'{field} is required'},
                    status=400
                )
        
        # Check if email already exists
        existing_user = DBSession.query(User).filter_by(email=data['email']).first()
        if existing_user:
            return Response(
                json={'success': False, 'message': 'Email already registered'},
                status=400
            )
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            role=UserRole.MEMBER if data.get('role') != 'librarian' else UserRole.LIBRARIAN
        )
        user.set_password(data['password'])
        
        DBSession.add(user)
        DBSession.flush()
        
        # Create token
        token = create_token(user.id, request.registry.settings['jwt.secret'])
        
        return Response(
            json={
                'success': True,
                'message': 'Registration successful',
                'data': {
                    'user': user.to_dict(),
                    'token': token
                }
            },
            status=201
        )
        
    except Exception as e:
        DBSession.rollback()
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='auth_login', request_method='POST', renderer='json')
def login(request):
    """Login user"""
    try:
        data = request.json_body
        
        # Validate input
        if 'email' not in data or 'password' not in data:
            return Response(
                json={'success': False, 'message': 'Email and password are required'},
                status=400
            )
        
        # Find user
        user = DBSession.query(User).filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return Response(
                json={'success': False, 'message': 'Invalid email or password'},
                status=401
            )
        
        # Create token
        token = create_token(user.id, request.registry.settings['jwt.secret'])
        
        return Response(
            json={
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': user.to_dict(),
                    'token': token
                }
            },
            status=200
        )
        
    except Exception as e:
        return Response(
            json={'success': False, 'message': str(e)},
            status=500
        )

@view_config(route_name='auth_me', request_method='GET', renderer='json')
def get_me(request):
    """Get current user info"""
    user = get_user_from_token(request)
    
    if not user:
        return Response(
            json={'success': False, 'message': 'Unauthorized'},
            status=401
        )
    
    return Response(
        json={
            'success': True,
            'data': user.to_dict()
        },
        status=200
    )
