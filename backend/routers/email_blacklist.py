import socket
import logging
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re

router = APIRouter(prefix="/email", tags=["Email Tools"])
logger = logging.getLogger(__name__)

# Common DNSBL providers for spam checks
DNSBL_PROVIDERS = [
    "zen.spamhaus.org",
    "bl.spamcop.net",
    "b.barracudacentral.org",
]

class EmailBlacklistRequest(BaseModel):
    email: str

def extract_domain(email_str: str) -> str:
    match = re.search(r'@([\w.-]+)', str(email_str))
    if match:
        return match.group(1).lower()
    return ""

async def check_dnsbl(domain: str, provider: str) -> bool:
    try:
        # Resolve domain to IP first
        ip = socket.gethostbyname(domain)
        reversed_ip = ".".join(reversed(ip.split(".")))
        query = f"{reversed_ip}.{provider}"
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, socket.gethostbyname, query)
        return True # If it resolves, it's blacklisted
    except socket.gaierror:
        return False # Doesn't resolve -> not blacklisted
    except Exception as e:
        logger.error(f"DNSBL lookup failed for {domain} on {provider}: {e}")
        return False

@router.post("/blacklist-check")
async def email_blacklist_check(request: EmailBlacklistRequest):
    domain = extract_domain(request.email)
    if not domain:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    
    results = []
    is_blacklisted = False
    
    for provider in DNSBL_PROVIDERS:
        blacklisted = await check_dnsbl(domain, provider)
        results.append({
            "provider": provider,
            "blacklisted": blacklisted
        })
        if blacklisted:
            is_blacklisted = True
            
    summary = "Email domain is safe and not found on common blacklists."
    if is_blacklisted:
        summary = "Email domain is flagged on one or more blacklists!"
        
    return {
        "email": request.email,
        "domain": domain,
        "is_blacklisted": is_blacklisted,
        "summary": summary,
        "details": results
    }
