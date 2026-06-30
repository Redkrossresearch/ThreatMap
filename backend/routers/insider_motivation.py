from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, InsiderMotivationRecord
from models.schemas import InsiderMotivationCreate, InsiderMotivationUpdate, InsiderMotivationResponse
import datetime

router = APIRouter(
    prefix="/api/insider-motivation",
    tags=["insider_motivation"],
    responses={404: {"description": "Not found"}},
)

def calculate_motivation_scores(record: InsiderMotivationCreate | InsiderMotivationUpdate | InsiderMotivationRecord) -> tuple[int, int, int, int, int, str, str]:
    # Initialize scores
    financial = 0
    revenge = 0
    negligence = 0
    curiosity = 0
    ext_influence = 0
    
    # Extract metrics safely
    exfiltration = getattr(record, 'data_exfiltration_volume_mb', 0) or 0
    after_hours = getattr(record, 'after_hours_logins', 0) or 0
    failed_logins = getattr(record, 'failed_login_attempts', 0) or 0
    priv_escalation = getattr(record, 'privilege_escalation_attempts', 0) or 0
    unauth_access = getattr(record, 'unauthorized_directory_accesses', 0) or 0
    
    # Calculate Financial
    if exfiltration > 1000:
        financial += 40
    elif exfiltration > 100:
        financial += 15
    if after_hours > 5:
        financial += 10
        
    # Calculate Revenge
    if priv_escalation > 2:
        revenge += 30
    if unauth_access > 5:
        revenge += 20
    if failed_logins > 10:
        revenge += 15
        
    # Calculate Negligence
    if failed_logins > 5:
        negligence += 30
    if unauth_access > 2:
        negligence += 15
        
    # Calculate Curiosity
    if unauth_access > 0:
        curiosity += 25
    if priv_escalation > 0:
        curiosity += 15
    if after_hours > 2:
        curiosity += 10
        
    # Calculate External Influence
    if exfiltration > 500:
        ext_influence += 20
    if after_hours > 4:
        ext_influence += 20
        
    # Normalize scores to max 100
    financial = min(financial + 5, 100) # Base 5% probability
    revenge = min(revenge + 2, 100)
    negligence = min(negligence + 10, 100)
    curiosity = min(curiosity + 15, 100)
    ext_influence = min(ext_influence + 1, 100)
    
    scores = {
        "Financial": financial,
        "Revenge": revenge,
        "Negligence": negligence,
        "Curiosity": curiosity,
        "External Influence": ext_influence
    }
    
    primary_motivation = max(scores, key=scores.get)
    
    # Generate Recommendation based on Primary Motivation
    recommendation = ""
    if primary_motivation == "Financial":
        recommendation = "Analysis: High probability of financial motivation detected due to significant data exfiltration patterns and after-hours activity. Recommended Action: Initiate immediate account suspension to prevent further data exfiltration. Isolate workstation and alert Incident Response."
    elif primary_motivation == "Revenge":
        recommendation = "Analysis: Revenge/Sabotage patterns detected through aggressive privilege escalation and unauthorized accesses. Recommended Action: Revoke all administrative privileges immediately. Notify HR and management for intervention."
    elif primary_motivation == "Curiosity":
        recommendation = "Analysis: User is exploring unauthorized directories. Recommended Action: Enforce stricter RBAC controls and provide security awareness training regarding data access policies."
    elif primary_motivation == "Negligence":
        recommendation = "Analysis: Multiple failed logins suggest poor password management or negligence. Recommended Action: Force password reset and mandate multi-factor authentication (MFA) training."
    else:
        recommendation = "Analysis: Possible external influence or account compromise. Recommended Action: Monitor account closely for anomalous geographical login attempts and investigate device integrity."
        
    return financial, revenge, negligence, curiosity, ext_influence, primary_motivation, recommendation


@router.get("/", response_model=List[InsiderMotivationResponse])
def get_all_records(db: Session = Depends(get_db)):
    return db.query(InsiderMotivationRecord).all()

@router.get("/{id}", response_model=InsiderMotivationResponse)
def get_record(id: int, db: Session = Depends(get_db)):
    record = db.query(InsiderMotivationRecord).filter(InsiderMotivationRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.post("/", response_model=InsiderMotivationResponse)
def create_record(record: InsiderMotivationCreate, db: Session = Depends(get_db)):
    db_record = InsiderMotivationRecord(**record.model_dump())
    
    fin, rev, neg, cur, ext, primary, rec = calculate_motivation_scores(db_record)
    db_record.score_financial = fin
    db_record.score_revenge = rev
    db_record.score_negligence = neg
    db_record.score_curiosity = cur
    db_record.score_external_influence = ext
    db_record.primary_motivation = primary
    db_record.ai_recommendation = rec
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{id}", response_model=InsiderMotivationResponse)
def update_record(id: int, record_update: InsiderMotivationUpdate, db: Session = Depends(get_db)):
    db_record = db.query(InsiderMotivationRecord).filter(InsiderMotivationRecord.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    update_data = record_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    fin, rev, neg, cur, ext, primary, rec = calculate_motivation_scores(db_record)
    db_record.score_financial = fin
    db_record.score_revenge = rev
    db_record.score_negligence = neg
    db_record.score_curiosity = cur
    db_record.score_external_influence = ext
    db_record.primary_motivation = primary
    db_record.ai_recommendation = rec
    db_record.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{id}")
def delete_record(id: int, db: Session = Depends(get_db)):
    db_record = db.query(InsiderMotivationRecord).filter(InsiderMotivationRecord.id == id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db.delete(db_record)
    db.commit()
    return {"detail": "Record deleted"}
