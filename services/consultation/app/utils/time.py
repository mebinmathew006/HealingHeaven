from datetime import datetime
from zoneinfo import ZoneInfo

def utc_to_ist(utc_dt: datetime) -> datetime:
    return utc_dt.astimezone(ZoneInfo("Asia/Kolkata"))
