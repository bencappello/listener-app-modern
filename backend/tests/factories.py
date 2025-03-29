"""
Test factories for generating test data.
These will be implemented as we create the models in the following steps.
This file serves as a placeholder for now.
"""
import factory
from factory.faker import Faker
from typing import Any, Dict, List

# Mock factories for now
# These will be replaced with SQLAlchemy factories in the next steps


class BaseFactory:
    """Base factory class with common attributes."""
    
    id = factory.Sequence(lambda n: n + 1)
    created_at = Faker('date_time')
    updated_at = Faker('date_time')


class UserFactory(BaseFactory):
    """Factory for User instances."""
    
    username = Faker('user_name')
    email = Faker('email')
    password = 'password123'
    
    @classmethod
    def create(cls, **kwargs: Any) -> Dict[str, Any]:
        """
        Create a mock user.
        Will be replaced with actual model creation in Step 7.
        
        Args:
            **kwargs: User attributes
            
        Returns:
            Dict[str, Any]: Mock user data
        """
        data = {
            'id': kwargs.get('id', cls.id.evaluate(None, None, {})),
            'username': kwargs.get('username', cls.username.evaluate(None, None, {})),
            'email': kwargs.get('email', cls.email.evaluate(None, None, {})),
            'password': kwargs.get('password', cls.password),
            'created_at': kwargs.get('created_at', cls.created_at.evaluate(None, None, {})),
            'updated_at': kwargs.get('updated_at', cls.updated_at.evaluate(None, None, {})),
        }
        return data


class SongFactory(BaseFactory):
    """Factory for Song instances."""
    
    name = Faker('sentence', nb_words=4)
    band_name = Faker('company')
    audio_url = Faker('url')
    song_type = factory.Iterator(['regular', 'remix'])
    
    @classmethod
    def create(cls, **kwargs: Any) -> Dict[str, Any]:
        """
        Create a mock song.
        Will be replaced with actual model creation in Step 8.
        
        Args:
            **kwargs: Song attributes
            
        Returns:
            Dict[str, Any]: Mock song data
        """
        data = {
            'id': kwargs.get('id', cls.id.evaluate(None, None, {})),
            'name': kwargs.get('name', cls.name.evaluate(None, None, {})),
            'band_name': kwargs.get('band_name', cls.band_name.evaluate(None, None, {})),
            'audio_url': kwargs.get('audio_url', cls.audio_url.evaluate(None, None, {})),
            'song_type': kwargs.get('song_type', cls.song_type.evaluate(None, None, {})),
            'blog_id': kwargs.get('blog_id', 1),
            'created_at': kwargs.get('created_at', cls.created_at.evaluate(None, None, {})),
            'updated_at': kwargs.get('updated_at', cls.updated_at.evaluate(None, None, {})),
        }
        return data


class BlogFactory(BaseFactory):
    """Factory for Blog instances."""
    
    name = Faker('company')
    
    @classmethod
    def create(cls, **kwargs: Any) -> Dict[str, Any]:
        """
        Create a mock blog.
        Will be replaced with actual model creation in Step 8.
        
        Args:
            **kwargs: Blog attributes
            
        Returns:
            Dict[str, Any]: Mock blog data
        """
        data = {
            'id': kwargs.get('id', cls.id.evaluate(None, None, {})),
            'name': kwargs.get('name', cls.name.evaluate(None, None, {})),
            'user_id': kwargs.get('user_id', 1),
            'created_at': kwargs.get('created_at', cls.created_at.evaluate(None, None, {})),
            'updated_at': kwargs.get('updated_at', cls.updated_at.evaluate(None, None, {})),
        }
        return data 