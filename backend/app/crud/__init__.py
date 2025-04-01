# CRUD package initialization
from .base import CRUDBase

from app.models.user import User
from app.schemas.users.user import UserCreate, UserUpdate

from app.models.song import Song
from app.schemas.songs.song import SongCreate, SongUpdate
from .song import CRUDSong

from app.models.band import Band
from app.schemas.band import BandCreate, BandUpdate
from .crud_band import crud_band as band

from app.models.blog import Blog
from app.schemas.blogs.blog import BlogCreate, BlogUpdate
from .blog import blog

# User CRUD
user = CRUDBase[User, UserCreate, UserUpdate](User)

# Song CRUD
song = CRUDSong(Song)

# Band CRUD
# band = CRUDBase[Band, BandCreate, BandUpdate](Band)

# Blog CRUD
# blog = CRUDBase[Blog, BlogCreate, BlogUpdate](Blog)

# More CRUD objects can be added here for other models
# from .item import item
from .comment import comment
# Use the instance named 'tag' from crud/tag.py
from .tag import tag
# etc. 