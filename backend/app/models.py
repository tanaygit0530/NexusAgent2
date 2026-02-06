from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from .database import Base
import datetime
import enum

class TicketStatus(str, enum.Enum):
    RECEIVED = "Received"
    PROCESSING = "Processing"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"

class TicketSource(str, enum.Enum):
    WHATSAPP = "WhatsApp"
    EMAIL = "Email"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)
    source = Column(String)  # WhatsApp or Email
    sender = Column(String)  # Phone number or Email address
    original_message = Column(Text)
    
    summary = Column(String)
    category = Column(String)
    priority = Column(String) # Low, Medium, High, Critical
    department = Column(String) # Network, Hardware, Software, Access
    sentiment = Column(String)
    
    status = Column(String, default=TicketStatus.RECEIVED)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # AI Processing logs/guardrail info
    ai_raw_output = Column(Text, nullable=True)
    validation_errors = Column(Text, nullable=True)
