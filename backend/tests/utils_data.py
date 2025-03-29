"""
Utilities for loading test data.
"""
import os
import json
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session


def load_json_data(file_path: str) -> Any:
    """
    Load JSON data from a file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Any: Loaded JSON data
    """
    with open(file_path, 'r') as f:
        return json.load(f)


def load_test_songs() -> List[Dict[str, Any]]:
    """
    Load test song data.
    
    Returns:
        List[Dict[str, Any]]: List of test songs
    """
    file_path = os.path.join(os.path.dirname(__file__), 'data', 'test_songs.json')
    return load_json_data(file_path)


def insert_test_songs(db: Session, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Insert test songs into the database.
    This is a placeholder - to be implemented in Step 8 when we implement the Song model.
    
    Args:
        db: Database session
        user_id: Optional user ID to assign to songs
        
    Returns:
        List[Dict[str, Any]]: List of inserted songs
    """
    # This will be implemented in Step 8
    # For now, return mock songs
    songs = load_test_songs()
    if user_id:
        for song in songs:
            song['user_id'] = user_id
    return songs 