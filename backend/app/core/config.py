import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "fitstream.db"
EXERCISES_JSON = DATA_DIR / "exercises.json"

DATA_DIR.mkdir(exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
SECRET_KEY = os.getenv("SECRET_KEY", "fitstream-dev-secret-key-change-in-production")