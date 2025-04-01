from pydantic import BaseModel
from datetime import datetime

class UserFollowBase(BaseModel):
    follower_id: int
    followed_id: int
    is_following: bool = True

class UserFollowCreate(UserFollowBase):
    # No extra fields needed for creation beyond base
    pass

class UserFollow(UserFollowBase):
    followed_at: datetime

    class Config:
        orm_mode = True 