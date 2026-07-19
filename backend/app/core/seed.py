import json
from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.core.config import EXERCISES_JSON


def seed_exercises(db: Session):
    if db.query(Exercise).first():
        return

    with open(EXERCISES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        ex = Exercise(
            id=item["id"],
            name=item["name"],
            category=item["category"],
            body_part=item["body_part"],
            equipment=item["equipment"],
            target=item["target"],
            muscle_group=item.get("muscle_group", ""),
            secondary_muscles=item.get("secondary_muscles", []),
            instructions=item["instructions"]["en"],
            media_id=item.get("media_id")
        )
        db.add(ex)

    db.commit()
    print(f"Seeded {len(data)} exercises")