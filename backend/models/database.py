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


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String(255), index=True, nullable=False)
    resource = Column(String(255), nullable=False)
    user_ip = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
