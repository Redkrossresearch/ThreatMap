from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, UserTrustRecord
from models.schemas import UserTrustCreate, UserTrustUpdate, UserTrustResponse
import datetime

router = APIRouter(
    prefix="/api/trust-score",
    tags=["trust_score"],
    responses={404: {"description": "Not found"}},
)

def calculate_trust_score(record: UserTrustCreate | UserTrustUpdate | UserTrustRecord) -> tuple[int, str, str]:
    score = 100
    
    mfa_status = getattr(record, 'mfa_status', True)
    if not mfa_status:
        score -= 30
        
    pwd_strength = getattr(record, 'password_strength', "STRONG").upper()
    if pwd_strength == "WEAK":
        score -= 20
    elif pwd_strength == "MEDIUM":
        score -= 10
        
    device_rep = getattr(record, 'device_reputation', "KNOWN").upper()
    if device_rep == "SUSPICIOUS":
        score -= 30
    elif device_rep == "UNKNOWN":
        score -= 15
        
    failed_logins = getattr(record, 'failed_login_attempts', 0) or 0
    score -= (failed_logins * 5)
    
    impossible_travel = getattr(record, 'impossible_travel', False)
    if impossible_travel:
        score -= 40
        
    account_lockouts = getattr(record, 'account_lockouts', 0) or 0
    score -= (account_lockouts * 20)
    
    # Ensure score is within 0-100
    score = max(0, min(100, score))
    
    # Determine Trust Level
    if score <= 40:
        level = "Low"
    elif score <= 70:
        level = "Medium"
    else:
        level = "High"
        
    # Generate AI Recommendation
    recommendation = ""
    if level == "High":
        recommendation = "Analysis: The user maintains a high baseline of trust. Authentication patterns are stable and secure. Recommended Action: Continue standard monitoring. No immediate action required."
    elif level == "Medium":
        recommendation = "Analysis: User trust is degraded due to anomalous factors (e.g., failed logins or unknown device usage). Recommended Action: Mandate a password reset and verify recent login attempts with the user."
    else:
        recommendation = "Analysis: Critical trust deficit detected. Multiple risk factors present including possible impossible travel or repeated lockouts. Recommended Action: Immediately suspend account access, force MFA re-enrollment, and initiate a security incident review."
        
    return score, level, recommendation


@router.get("/", response_model=List[UserTrustResponse])
def get_all_records(db: Session = Depends(get_db)):
    return db.query(UserTrustRecord).all()

@router.get("/{id}", response_model=UserTrustResponse)
def get_record(id: int, db: Session = Depends(get_db)):
    record = db.query(UserTrustRecord).filter(UserTrustRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.post("/", response_model=UserTrustResponse)
def create_record(record: UserTrustCreate, db: Session = Depends(get_db)):
    db_record = UserTrustRecord(**record.model_dump())
    
    score, level, rec = calculate_trust_score(db_record)
    db_record.trust_score = score
    db_record.trust_level = level
    db_record.ai_recommendation = rec
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{id}", response_model=UserTrustResponse)
def update_record(id: int, record_update: UserTrustUpdate, db: Session = Depends(get_db)):
    db_record = db.query(UserTrustRecord).filter(UserTrustRecord.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    update_data = record_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    score, level, rec = calculate_trust_score(db_record)
    db_record.trust_score = score
    db_record.trust_level = level
    db_record.ai_recommendation = rec
    db_record.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{id}")
def delete_record(id: int, db: Session = Depends(get_db)):
    db_record = db.query(UserTrustRecord).filter(UserTrustRecord.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db.delete(db_record)
    db.commit()
    return {"detail": "Record deleted"}
