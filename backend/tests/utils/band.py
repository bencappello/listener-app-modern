import random
import string

from sqlalchemy.orm import Session

from app.models.band import Band
from app.schemas.band import BandCreate

def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))

def create_random_band(db: Session, *, name: str | None = None) -> Band:
    """Create a random band for testing."""
    if name is None:
        name = random_lower_string(12)
    description = random_lower_string(40)
    band_in = BandCreate(name=name, description=description)
    
    # Use direct model creation for tests
    band_obj = Band(**band_in.model_dump())
    db.add(band_obj)
    db.commit()
    db.refresh(band_obj)
    return band_obj 