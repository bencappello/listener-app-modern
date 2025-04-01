import random
import string

from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.schemas.blogs.blog import BlogCreate


def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))


def random_url() -> str:
    return f"https://{random_lower_string(8)}.com"


def create_random_blog(db: Session, *, name: str | None = None, url: str | None = None) -> Blog:
    """Create a random blog for testing."""
    if name is None:
        name = random_lower_string(10)
    if url is None:
        url = random_url()
    description = random_lower_string(50)
    is_active = True
    blog_in = BlogCreate(name=name, url=url, description=description, is_active=is_active)
    
    # Use direct model creation for tests if CRUD isn't available/needed here
    # or import crud.blog if it exists and is safe to use in utils
    blog_obj = Blog(**blog_in.model_dump())
    db.add(blog_obj)
    db.commit()
    db.refresh(blog_obj)
    return blog_obj 