"""Domain exceptions for identity module."""


class IdentityError(Exception):
    """Base domain exception for identity operations."""


class UserNotFoundError(IdentityError):
    """Raised when a user entity cannot be found by identifier."""

    def __init__(self, identifier: str) -> None:
        super().__init__(f"User not found: {identifier}")
        self.identifier = identifier


class InvalidTokenError(IdentityError):
    """Raised when an authentication token is missing, expired, or invalid."""

    def __init__(self, message: str = "Invalid authentication token") -> None:
        super().__init__(message)


class UnauthorizedError(IdentityError):
    """Raised when a user lacks permission for an operation."""

    def __init__(self, message: str = "Unauthorized operation") -> None:
        super().__init__(message)
