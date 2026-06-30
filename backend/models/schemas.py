from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class ScanBase(BaseModel):
    indicator: str
    type: str
    refresh: bool = False

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    id: str
    risk_score: int
    risk_level: str
    summary: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WatchlistBase(BaseModel):
    indicator: str
    type: str
    notes: Optional[str] = None
    custom_threshold: Optional[int] = None
    tags: Optional[str] = None
    schedule_frequency: Optional[str] = None
    webhook_url: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    notes: Optional[str] = None
    custom_threshold: Optional[int] = None
    tags: Optional[str] = None
    schedule_frequency: Optional[str] = None
    webhook_url: Optional[str] = None

class WatchlistResponse(WatchlistBase):
    id: int
    added_at: datetime
    last_scanned_at: datetime
    last_risk_score: int

    model_config = ConfigDict(from_attributes=True)


class AlertBase(BaseModel):
    indicator: str
    alert_type: str
    title: str
    message: Optional[str] = None
    risk_score: int

class AlertResponse(AlertBase):
    id: int
    is_dismissed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertUpdate(BaseModel):
    is_dismissed: bool


# Dashboard Summary Schemes
class StatCardData(BaseModel):
    value: str
    trend: str
    status: str

class DashboardStats(BaseModel):
    total_scans_24h: int
    critical_threats: int
    high_risk_assets: int
    monitored_iocs: int
    recent_scans: List[ScanResponse]
    alerts: List[AlertResponse]
    threat_distribution: Dict[str, int] # e.g. {"critical": 25, "high": 35, "medium": 30, "low": 10}
    malware_prevalence: List[Dict[str, Any]] # e.g. [{"name": "Ransom.LockBit", "percentage": 82, "trend": "up"}]


# Burnout Schemes
class BurnoutBase(BaseModel):
    employee_id: str
    employee_name: str
    department: Optional[str] = None
    login_time: Optional[datetime] = None
    logout_time: Optional[datetime] = None
    working_hours: Optional[int] = 0
    overtime_hours: Optional[int] = 0
    weekend_logins: Optional[int] = 0
    after_hours_logins: Optional[int] = 0
    failed_login_attempts: Optional[int] = 0
    device_information: Optional[str] = None
    ip_address: Optional[str] = None

class BurnoutCreate(BurnoutBase):
    pass

class BurnoutUpdate(BaseModel):
    employee_name: Optional[str] = None
    department: Optional[str] = None
    login_time: Optional[datetime] = None
    logout_time: Optional[datetime] = None
    working_hours: Optional[int] = None
    overtime_hours: Optional[int] = None
    weekend_logins: Optional[int] = None
    after_hours_logins: Optional[int] = None
    failed_login_attempts: Optional[int] = None
    device_information: Optional[str] = None
    ip_address: Optional[str] = None

class BurnoutResponse(BurnoutBase):
    id: int
    last_activity: datetime
    burnout_risk_score: int
    burnout_risk_level: str
    ai_recommendation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Insider Motivation Schemes
class InsiderMotivationBase(BaseModel):
    employee_id: str
    employee_name: str
    department: Optional[str] = None
    data_exfiltration_volume_mb: Optional[int] = 0
    after_hours_logins: Optional[int] = 0
    failed_login_attempts: Optional[int] = 0
    privilege_escalation_attempts: Optional[int] = 0
    unauthorized_directory_accesses: Optional[int] = 0
    device_information: Optional[str] = None
    ip_address: Optional[str] = None
    suspicious_events: Optional[List[Dict[str, Any]]] = None

class InsiderMotivationCreate(InsiderMotivationBase):
    pass

class InsiderMotivationUpdate(BaseModel):
    employee_name: Optional[str] = None
    department: Optional[str] = None
    data_exfiltration_volume_mb: Optional[int] = None
    after_hours_logins: Optional[int] = None
    failed_login_attempts: Optional[int] = None
    privilege_escalation_attempts: Optional[int] = None
    unauthorized_directory_accesses: Optional[int] = None
    device_information: Optional[str] = None
    ip_address: Optional[str] = None
    suspicious_events: Optional[List[Dict[str, Any]]] = None

class InsiderMotivationResponse(InsiderMotivationBase):
    id: int
    score_financial: int
    score_revenge: int
    score_negligence: int
    score_curiosity: int
    score_external_influence: int
    primary_motivation: str
    ai_recommendation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# User Trust Score Schemes
class UserTrustBase(BaseModel):
    user_id: str
    name: str
    department: Optional[str] = None
    role: Optional[str] = None
    last_login: Optional[datetime] = None
    failed_login_attempts: Optional[int] = 0
    mfa_status: Optional[bool] = True
    password_strength: Optional[str] = "STRONG"
    device_reputation: Optional[str] = "KNOWN"
    ip_address: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None
    vpn_usage: Optional[bool] = False
    impossible_travel: Optional[bool] = False
    account_lockouts: Optional[int] = 0
    privilege_level: Optional[str] = "USER"
    login_history: Optional[List[Dict[str, Any]]] = None
    recent_security_events: Optional[List[Dict[str, Any]]] = None

class UserTrustCreate(UserTrustBase):
    pass

class UserTrustUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    last_login: Optional[datetime] = None
    failed_login_attempts: Optional[int] = None
    mfa_status: Optional[bool] = None
    password_strength: Optional[str] = None
    device_reputation: Optional[str] = None
    ip_address: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None
    vpn_usage: Optional[bool] = None
    impossible_travel: Optional[bool] = None
    account_lockouts: Optional[int] = None
    privilege_level: Optional[str] = None
    login_history: Optional[List[Dict[str, Any]]] = None
    recent_security_events: Optional[List[Dict[str, Any]]] = None

class UserTrustResponse(UserTrustBase):
    id: int
    trust_score: int
    trust_level: str
    ai_recommendation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
