import pytest

from app.services.favorites import (
    get_user_favorites_async, add_to_favorites_async, 
    remove_from_favorites_async, check_if_favorited_async
)


def test_favorites_async_functions_exist():
    """Test that async favorites service functions exist."""
    # This test simply verifies that the functions exist and are callable
    assert callable(get_user_favorites_async)
    assert callable(add_to_favorites_async)
    assert callable(remove_from_favorites_async)
    assert callable(check_if_favorited_async) 