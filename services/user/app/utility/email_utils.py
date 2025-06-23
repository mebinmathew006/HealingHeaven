# app/utility/email_utils.py
import os
from email.message import EmailMessage
from aiosmtplib import send
from dotenv import load_dotenv
from infra.celery_worker import celery_app
load_dotenv()

MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER")
MAIL_PORT = int(os.getenv("MAIL_PORT"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")



async def send_welcome_email(to_email: str, user_name: str):
    message = EmailMessage()
    message["From"] = f"Healing Heaven <{MAIL_FROM}>"
    message["To"] = to_email
    message["Subject"] = "Welcome to Healing Heaven!"
    message.set_content(f"Hello {user_name},\n\nWelcome to Healing Heaven.\n\nRegards,\nTeam")

    await send(
        message,
        hostname=MAIL_SERVER,
        port=MAIL_PORT,
        username=MAIL_USERNAME,
        password=MAIL_PASSWORD,
        start_tls=True,
    )

import smtplib
from email.message import EmailMessage

@celery_app.task(name="tasks.send_otp_email_task")
def send_otp_email(to_email: str, otp: str):
    message = EmailMessage()
    message["From"] = f"Healing Heaven <{MAIL_FROM}>"
    message["To"] = to_email
    message["Subject"] = "Your OTP Code"
    message.set_content(
        f"""
        Hello,

        Your OTP code is: {otp}

        It is valid for the next 10 minutes.

        Regards,
        Healing Heaven Team
        """
    )

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(message)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise
