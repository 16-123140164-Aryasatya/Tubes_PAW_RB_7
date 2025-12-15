from pyramid.view import view_config
from pyramid.response import Response
import json

def success_response(data=None, message="Success"):
    """Standard success response"""
    return Response(
        json={"success": True, "message": message, "data": data},
        status=200,
        content_type='application/json'
    )

def error_response(message="Error", status=400, errors=None):
    """Standard error response"""
    return Response(
        json={"success": False, "message": message, "errors": errors},
        status=status,
        content_type='application/json'
    )
