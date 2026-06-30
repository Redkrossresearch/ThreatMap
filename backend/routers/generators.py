from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from services.generator_service import generator_service

router = APIRouter(prefix="/generators", tags=["Generators"])

class YaraRequest(BaseModel):
    file_hash: str = ""
    malware_name: str = ""
    malware_family: str = ""
    ioc_information: str = ""
    behavior_description: str = ""

class SigmaRequest(BaseModel):
    ip_address: str = ""
    domain: str = ""
    url: str = ""
    cve_id: str = ""
    threat_actor: str = ""
    attack_description: str = ""

@router.post("/yara")
async def generate_yara(req: YaraRequest):
    try:
        rule = await generator_service.generate_yara_rule(req.dict())
        return {"status": "success", "rule": rule}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sigma")
async def generate_sigma(req: SigmaRequest):
    try:
        rule = await generator_service.generate_sigma_rule(req.dict())
        return {"status": "success", "rule": rule}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
