from app.crud.base import CRUDBase
from app.models.band import Band
from app.schemas.band import BandCreate, BandUpdate


class CRUDBand(CRUDBase[Band, BandCreate, BandUpdate]):
    # Add any band-specific CRUD methods here if needed
    # For example:
    # def get_by_name(self, db: Session, *, name: str) -> Band | None:
    #     return db.query(Band).filter(Band.name == name).first()
    pass


crud_band = CRUDBand(Band) 