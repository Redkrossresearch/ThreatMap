import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, CyberExposureAsset
from models.schemas import AssetCreate, AssetUpdate, AssetResponse
from typing import List

router = APIRouter(
    prefix="/cyber-exposure",
    tags=["Cyber Exposure"]
)

def calculate_asset_exposure(asset: AssetCreate | AssetUpdate | CyberExposureAsset) -> dict:
    # Logic to calculate score based on vulnerabilities and exposure
    base_score = 100
    
    # Deductions based on CVEs
    cve_deduction = (
        (asset.critical_cves * 15) + 
        (asset.high_cves * 10) + 
        (asset.medium_cves * 5) + 
        (asset.low_cves * 2)
    )
    
    # Deductions based on public exposure
    exposure_deduction = 0
    if asset.public_exposure_status:
        exposure_deduction += 20
    
    # Deductions based on open ports
    open_ports = asset.open_ports if asset.open_ports else []
    exposure_deduction += (len(open_ports) * 2)
    
    final_score = max(0, base_score - cve_deduction - exposure_deduction)
    
    # Determine level
    level = "Low"
    if final_score <= 30:
        level = "Critical"
    elif final_score <= 70:
        level = "Medium"
    elif final_score <= 90:
        level = "High"
    
    # AI Recommendation heuristics
    recommendation = "Asset is secure. Continue regular monitoring."
    if asset.critical_cves > 0:
        recommendation = f"Immediate action required: Patch {asset.critical_cves} critical vulnerabilities."
    elif asset.public_exposure_status and (asset.high_cves > 0 or asset.medium_cves > 0):
        recommendation = "Publicly exposed asset with vulnerabilities. Restrict access or patch immediately."
    elif len(open_ports) > 3:
        recommendation = f"Reduce attack surface by closing unnecessary open ports ({', '.join(map(str, open_ports[:3]))} ...)."
    
    return {
        "exposure_score": final_score,
        "exposure_level": level,
        "ai_recommendation": recommendation,
        "vulnerability_count": asset.critical_cves + asset.high_cves + asset.medium_cves + asset.low_cves,
        "attack_surface_score": min(100, (len(open_ports) * 5) + (20 if asset.public_exposure_status else 0))
    }

@router.get("/summary")
def get_exposure_summary(db: Session = Depends(get_db)):
    assets = db.query(CyberExposureAsset).all()
    if not assets:
        return {"overall_score": 100, "level": "Low", "assets_count": 0}
        
    total_score = sum([a.exposure_score for a in assets])
    avg_score = int(total_score / len(assets))
    
    level = "Low"
    if avg_score <= 30:
        level = "Critical"
    elif avg_score <= 70:
        level = "Medium"
    elif avg_score <= 90:
        level = "High"
        
    # Aggregate stats
    public_ips = sum(1 for a in assets if a.public_exposure_status)
    open_ports = sum(len(a.open_ports) if a.open_ports else 0 for a in assets)
    leaked_creds = 0 # Mocked for dashboard
    vuln_services = sum(1 for a in assets if a.vulnerability_count > 0)
    
    return {
        "overall_score": avg_score,
        "level": level,
        "assets_count": len(assets),
        "breakdown": {
            "public_ips": public_ips,
            "open_ports": open_ports,
            "leaked_credentials": leaked_creds,
            "vulnerable_services": vuln_services
        }
    }

@router.get("", response_model=List[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(CyberExposureAsset).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(CyberExposureAsset).filter(CyberExposureAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=AssetResponse)
def create_asset(asset_in: AssetCreate, db: Session = Depends(get_db)):
    calc = calculate_asset_exposure(asset_in)
    
    db_asset = CyberExposureAsset(
        id=str(uuid.uuid4()),
        asset_name=asset_in.asset_name,
        asset_type=asset_in.asset_type,
        ip_address=asset_in.ip_address,
        hostname=asset_in.hostname,
        operating_system=asset_in.operating_system,
        open_ports=asset_in.open_ports,
        running_services=asset_in.running_services,
        public_exposure_status=asset_in.public_exposure_status,
        critical_cves=asset_in.critical_cves,
        high_cves=asset_in.high_cves,
        medium_cves=asset_in.medium_cves,
        low_cves=asset_in.low_cves,
        vulnerability_count=calc["vulnerability_count"],
        attack_surface_score=calc["attack_surface_score"],
        exposure_score=calc["exposure_score"],
        exposure_level=calc["exposure_level"],
        ai_recommendation=calc["ai_recommendation"]
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: str, asset_in: AssetUpdate, db: Session = Depends(get_db)):
    db_asset = db.query(CyberExposureAsset).filter(CyberExposureAsset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    update_data = asset_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
        
    # Recalculate
    calc = calculate_asset_exposure(db_asset)
    db_asset.vulnerability_count = calc["vulnerability_count"]
    db_asset.attack_surface_score = calc["attack_surface_score"]
    db_asset.exposure_score = calc["exposure_score"]
    db_asset.exposure_level = calc["exposure_level"]
    db_asset.ai_recommendation = calc["ai_recommendation"]
    db_asset.last_scan_time = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    db_asset = db.query(CyberExposureAsset).filter(CyberExposureAsset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(db_asset)
    db.commit()
    return {"message": "Asset deleted successfully"}
