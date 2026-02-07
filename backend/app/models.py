from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from .database import Base
import datetime
import enum

class TicketStatus(str, enum.Enum):
    RECEIVED = "Received"
    PROCESSING = "Processing"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"
    WAITING = "Waiting"
    SPAM = "Spam"
    CANCELLED = "Cancelled"

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
    department_confidence = Column(Integer, default=100)
    is_flagged = Column(String, default="false") # "true" or "false"
    reassigned_by = Column(String, nullable=True) # "AI" or "Human"
    
    # Incident Swarm Detection
    is_duplicate = Column(String, default="false")
    parent_incident_id = Column(String, nullable=True)
    ticket_role = Column(String, default="Primary") # Primary | Follower
    similarity_score = Column(Integer, default=0)
    swarm_reason = Column(Text, nullable=True)
    
    # Input Completeness
    is_complete = Column(String, default="true") # "true" or "false"
    clarification_question = Column(Text, nullable=True)
    
    # Spam Detection
    is_spam = Column(String, default="false") # "true" or "false"
    spam_reason = Column(String, nullable=True)
    is_active = Column(String, default="true") # "true" or "false"
    
    sentiment = Column(String)
    
    # Human Handoff Summary
    handoff_summary = Column(Text, nullable=True)
    ai_attempts = Column(Text, nullable=True)
    next_best_action = Column(Text, nullable=True)
    
    status = Column(String, default=TicketStatus.RECEIVED)
    
    # Admin Workspace - Assignment Tracking
    assigned_to = Column(String, nullable=True)  # Admin username/email
    assigned_at = Column(DateTime, nullable=True)  # When ticket was assigned
    resolved_at = Column(DateTime, nullable=True)  # When ticket was resolved
    internal_notes = Column(Text, nullable=True)  # Admin internal notes
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # AI Processing logs/guardrail info
    ai_raw_output = Column(Text, nullable=True)
    validation_errors = Column(Text, nullable=True)
