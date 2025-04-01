from typing import Optional, List
from pydantic import BaseModel, HttpUrl

# Shared properties
class BandBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    website_url: Optional[HttpUrl] = None
    genre: Optional[str] = None

# Properties to receive on band creation
class BandCreate(BandBase):
    name: str

# Properties to receive on band update
class BandUpdate(BandBase):
    pass

# Properties shared by models stored in DB
class BandInDBBase(BandBase):
    id: int
    name: str

    class Config:
        from_attributes = True # Replaces orm_mode = True

# Properties to return to client
class Band(BandInDBBase):
    pass

# Properties stored in DB
class BandInDB(BandInDBBase):
    pass

# Relationship Schemas (example - adjust as needed)
# from .song import Song
# from .user import User

# class BandWithSongs(Band):
#     songs: List[Song] = []

# class BandWithFollowers(Band):
#     followers: List[User] = [] 