from pydantic import BaseModel
from datetime import datetime

class UserBlogBase(BaseModel):
    user_id: int
    blog_id: int
    is_following: bool = True

class UserBlogCreate(UserBlogBase):
    pass

class UserBlog(UserBlogBase):
    followed_at: datetime

    class Config:
        # orm_mode = True
        from_attributes = True # Pydantic V2 