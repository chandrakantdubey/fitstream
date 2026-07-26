import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.daily_tracker import DailyLog
from app.models.workout import WorkoutSession

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/csv")
def export_user_data_csv(user_id: str = "1", db: Session = Depends(get_db)):
    logs = db.query(DailyLog).filter(DailyLog.user_id == str(user_id)).order_by(DailyLog.log_date.asc()).all()
    sessions = db.query(WorkoutSession).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["--- DAILY TRACKING METRICS ---"])
    writer.writerow(["Date", "Water (ml)", "Active Minutes", "Calories Burned", "Height (cm)", "Weight (kg)", "BMI"])
    for l in logs:
        height_m = (l.height_cm or 175.0) / 100.0
        bmi = round((l.weight_kg or 70.0) / (height_m * height_m), 1) if height_m > 0 else 0
        writer.writerow([l.log_date, l.water_ml, l.active_minutes, l.calories_burned, l.height_cm, l.weight_kg, bmi])

    writer.writerow([])
    writer.writerow(["--- COMPLETED WORKOUT SESSIONS ---"])
    writer.writerow(["Session ID", "Workout ID", "Started At", "Completed At", "Duration (sec)"])
    for s in sessions:
        writer.writerow([s.id, s.workout_id, s.started_at, s.completed_at, s.duration_seconds])

    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=fitstream_data_export_{user_id}.csv"}
    )
