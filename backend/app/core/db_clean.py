from app.core.database import engine, Base
from app.models import *

def reset_db():
    print("Dropping all database tables for fresh initialization...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database cleanup complete!")

if __name__ == "__main__":
    reset_db()
