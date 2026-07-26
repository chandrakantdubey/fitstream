from sqlalchemy import inspect, text


def run_sqlite_compat_migrations(engine):
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "workouts" in table_names:
        workout_columns = {column["name"] for column in inspector.get_columns("workouts")}
        if "user_id" not in workout_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE workouts ADD COLUMN user_id VARCHAR"))
                connection.execute(
                    text("CREATE INDEX IF NOT EXISTS ix_workouts_user_id ON workouts (user_id)")
                )
