from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, Burnout
from models.schemas import BurnoutCreate, BurnoutUpdate, BurnoutResponse
import datetime

router = APIRouter(
    prefix="/api/burnout",
    tags=["burnout"],
    responses={404: {"description": "Not found"}},
)

def calculate_burnout_risk(record: BurnoutCreate | BurnoutUpdate | Burnout) -> tuple[int, str, str]:
    score = 0
    
    # Working hours (assuming standard is 40h/week)
    working_hours = getattr(record, 'working_hours', 0) or 0
    if working_hours > 60:
        score += 30
    elif working_hours > 50:
        score += 15
    elif working_hours > 40:
        score += 5
        
    # Overtime hours
    overtime_hours = getattr(record, 'overtime_hours', 0) or 0
    if overtime_hours > 15:
        score += 25
    elif overtime_hours > 5:
        score += 10
        
    # Weekend logins
    weekend_logins = getattr(record, 'weekend_logins', 0) or 0
    if weekend_logins > 3:
        score += 20
    elif weekend_logins > 0:
        score += 10
        
    # After-hours logins
    after_hours_logins = getattr(record, 'after_hours_logins', 0) or 0
    if after_hours_logins > 5:
        score += 15
    elif after_hours_logins > 2:
        score += 5
        
    # Failed login attempts
    failed_logins = getattr(record, 'failed_login_attempts', 0) or 0
    if failed_logins > 5:
        score += 10
        
    score = min(score, 100) # Cap at 100
    
    # Determine level
    if score <= 30:
        level = "LOW"
    elif score <= 70:
        level = "MEDIUM"
    else:
        level = "HIGH"
        
    # Generate mock AI recommendation
    recommendation = ""
    if level == "HIGH":
        recommendation = f"Analysis: High burnout risk detected due to {working_hours} working hours and {weekend_logins} weekend logins. Recommended Action: Mandatory cool-down period. Temporarily revoke non-essential access outside core hours."
    elif level == "MEDIUM":
        recommendation = f"Analysis: Medium burnout risk. {overtime_hours} overtime hours logged recently. Recommended Action: Monitor workload and ensure employee takes their weekend off."
    else:
        recommendation = "Analysis: Normal working patterns detected. No immediate risk. Recommended Action: Continue standard monitoring."
        
    return score, level, recommendation


@router.get("/", response_model=List[BurnoutResponse])
def get_all_burnout_records(db: Session = Depends(get_db)):
    return db.query(Burnout).all()

@router.get("/{id}", response_model=BurnoutResponse)
def get_burnout_record(id: int, db: Session = Depends(get_db)):
    record = db.query(Burnout).filter(Burnout.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Burnout record not found")
    return record

@router.post("/", response_model=BurnoutResponse)
def create_burnout_record(record: BurnoutCreate, db: Session = Depends(get_db)):
    db_record = Burnout(**record.model_dump())
    
    score, level, recommendation = calculate_burnout_risk(db_record)
    db_record.burnout_risk_score = score
    db_record.burnout_risk_level = level
    db_record.ai_recommendation = recommendation
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{id}", response_model=BurnoutResponse)
def update_burnout_record(id: int, record_update: BurnoutUpdate, db: Session = Depends(get_db)):
    db_record = db.query(Burnout).filter(Burnout.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Burnout record not found")
        
    update_data = record_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    # Recalculate risk
    score, level, recommendation = calculate_burnout_risk(db_record)
    db_record.burnout_risk_score = score
    db_record.burnout_risk_level = level
    db_record.ai_recommendation = recommendation
    db_record.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{id}")
def delete_burnout_record(id: int, db: Session = Depends(get_db)):
    db_record = db.query(Burnout).filter(Burnout.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Burnout record not found")
        
    db.delete(db_record)
    db.commit()
    return {"detail": "Burnout record deleted"}
