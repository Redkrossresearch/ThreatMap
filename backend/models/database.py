import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Handle schema prefixes if Supabase is used, fallback to sqlite locally
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, index=True)
    indicator = Column(String(255), index=True, nullable=False)
    type = Column(String(50), nullable=False) # ip, url, domain, hash
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(50), default="LOW", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    summary = Column(Text, nullable=True)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(50), nullable=False)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_scanned_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)
    last_risk_score = Column(Integer, default=0)
    custom_threshold = Column(Integer, nullable=True) # Alert threshold e.g., 70
    tags = Column(String(500), nullable=True) # comma separated
    schedule_frequency = Column(String(50), nullable=True) # "daily", "weekly"
    webhook_url = Column(String(500), nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), index=True, nullable=False)
    alert_type = Column(String(100), default="RISK_SHIFT") # RISK_INCREASE, WATCHED_MODIFIED, CVE_DETECTED
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    risk_score = Column(Integer, default=0)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ThreatActor(Base):
    __tablename__ = "threat_actors"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    aliases = Column(String(500), nullable=True) # comma separated
    country = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    industries = Column(String(500), nullable=True)
    active_since = Column(String(100), nullable=True)
    threat_level = Column(String(50), default="HIGH")
    mitre_tactics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CampaignIOC(Base):
    __tablename__ = "campaign_iocs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(String(36), index=True, nullable=False)
    scan_id = Column(String(36), nullable=False) # Reference to Scan.id
    added_at = Column(DateTime, default=datetime.datetime.utcnow)


class CommunityNote(Base):
    __tablename__ = "community_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), index=True, nullable=False)
    author = Column(String(255), default="Anonymous")
    text = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Burnout(Base):
    __tablename__ = "burnout_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(100), index=True, nullable=False)
    employee_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    login_time = Column(DateTime, nullable=True)
    logout_time = Column(DateTime, nullable=True)
    working_hours = Column(Integer, default=0) # Storing as integer (e.g. hours or minutes) or Float
    overtime_hours = Column(Integer, default=0)
    weekend_logins = Column(Integer, default=0)
    after_hours_logins = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    device_information = Column(String(500), nullable=True)
    ip_address = Column(String(100), nullable=True)
    last_activity = Column(DateTime, default=datetime.datetime.utcnow)
    burnout_risk_score = Column(Integer, default=0)
    burnout_risk_level = Column(String(50), default="LOW")
    ai_recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class InsiderMotivationRecord(Base):
    __tablename__ = "insider_motivations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(100), index=True, nullable=False)
    employee_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    
    # Behavior metrics
    data_exfiltration_volume_mb = Column(Integer, default=0)
    after_hours_logins = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    privilege_escalation_attempts = Column(Integer, default=0)
    unauthorized_directory_accesses = Column(Integer, default=0)
    device_information = Column(String(500), nullable=True)
    ip_address = Column(String(100), nullable=True)
    suspicious_events = Column(JSON, nullable=True) # List of dicts e.g., [{"time": "...", "event": "...", "severity": "..."}]
    
    # Calculated scores
    score_financial = Column(Integer, default=0)
    score_revenge = Column(Integer, default=0)
    score_negligence = Column(Integer, default=0)
    score_curiosity = Column(Integer, default=0)
    score_external_influence = Column(Integer, default=0)
    
    primary_motivation = Column(String(100), default="None")
    ai_recommendation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class UserTrustRecord(Base):
    __tablename__ = "user_trust_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)
    
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    mfa_status = Column(Boolean, default=True)
    password_strength = Column(String(50), default="STRONG") # STRONG, MEDIUM, WEAK
    device_reputation = Column(String(50), default="KNOWN") # KNOWN, UNKNOWN, SUSPICIOUS
    ip_address = Column(String(100), nullable=True)
    browser = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    vpn_usage = Column(Boolean, default=False)
    impossible_travel = Column(Boolean, default=False)
    account_lockouts = Column(Integer, default=0)
    privilege_level = Column(String(50), default="USER") # USER, ADMIN, ROOT
    
    login_history = Column(JSON, nullable=True)
    recent_security_events = Column(JSON, nullable=True)
    
    trust_score = Column(Integer, default=100)
    trust_level = Column(String(50), default="High") # High, Medium, Low
    ai_recommendation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
