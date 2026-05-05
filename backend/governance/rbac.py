from fastapi import Header, HTTPException

def require_role(allowed_roles: list):
    """
    FastAPI Dependency to enforce Role-Based Access Control.
    In a real app, this would decode a JWT token from the Authorization header.
    For this demo, we mock it by reading a custom 'X-User-Role' header.
    """
    def role_checker(x_user_role: str = Header(default="Manager", description="Mock JWT Role Claim")):
        if x_user_role not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Forbidden: Your role '{x_user_role}' is not in allowed roles {allowed_roles}"
            )
        return x_user_role
    
    return role_checker

def get_current_user(x_user_id: str = Header(default="USR_999", description="Mock User ID")):
    """Mocks extracting user ID from JWT."""
    return x_user_id
