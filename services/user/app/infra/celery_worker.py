from celery import Celery

celery_app = Celery(
    "user_service",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
)

# Ensure task is imported and registered
import utility.email_utils  # 👈 this executes the @celery_app.task decorator
