from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List
import json

from core.config import settings
from models.database import get_db, AuditLog
from audit_models import AuditLogResponse, AuditLogCreate

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs

@router.post("/", response_model=AuditLogResponse)
def create_audit_log(payload: AuditLogCreate, db: Session = Depends(get_db)):
    db_log = AuditLog(
        action=payload.action,
        resource=payload.resource,
        user_ip=payload.user_ip,
        details=payload.details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
