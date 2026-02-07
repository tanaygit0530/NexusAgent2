from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    RECEIVED = "Received"
    PROCESSING = "Processing"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"
    WAITING = "Waiting"
    SPAM = "Spam"
    CANCELLED = "Cancelled"

class TicketSource(str, Enum):
    WHATSAPP = "WhatsApp"
    EMAIL = "Email"
    WEBSITE = "Website"

class AIExtractionResult(BaseModel):
    summary: str = Field(..., description="A concise 1-sentence summary of the issue")
    category: str = Field(..., description="Generic category")
    priority: str = Field(..., description="Priority level: Low, Medium, High, Critical")
    department: str = Field(..., description="Department: Network, Hardware, Software, Access")
    sentiment: str = Field(..., description="User sentiment: Calm, Frustrated, Angry")
    confidence_score: float = Field(default=1.0)
    action: Optional[str] = "keep" # reroute | keep | flag_for_human
    # Swarm Detection
    is_duplicate: Optional[bool] = False
    parent_incident_id: Optional[str] = None
    ticket_role: Optional[str] = "Primary"
    similarity_score: Optional[float] = 0.0
    swarm_reason: Optional[str] = None
    # Input Completeness
    is_complete: Optional[bool] = True
    clarification_question: Optional[str] = None
    # Spam Detection
    is_spam: Optional[bool] = False
    spam_reason: Optional[str] = None
    is_active: Optional[bool] = True
    # Human Handoff Summary
    handoff_summary: Optional[str] = None
    ai_attempts: Optional[str] = None
    next_best_action: Optional[str] = None

class TicketCreate(BaseModel):
    source: TicketSource
    sender: str
    message: str

class TicketResponse(BaseModel):
    id: int
    ticket_id: str
    source: str
    sender: str
    summary: str
    category: str
    priority: str
    department: Optional[str] = None
    department_confidence: Optional[int] = 100
    is_flagged: Optional[str] = "false"
    reassigned_by: Optional[str] = None
    # Swarm Detection in response
    is_duplicate: Optional[str] = "false"
    parent_incident_id: Optional[str] = None
    ticket_role: Optional[str] = "Primary"
    similarity_score: Optional[int] = 0
    swarm_reason: Optional[str] = None
    # Input Completeness in response
    is_complete: Optional[str] = "true"
    clarification_question: Optional[str] = None
    # Spam Detection in response
    is_spam: Optional[str] = "false"
    spam_reason: Optional[str] = None
    is_active: Optional[str] = "true"
    # Human Handoff Summary in response
    handoff_summary: Optional[str] = None
    ai_attempts: Optional[str] = None
    next_best_action: Optional[str] = None
    sentiment: Optional[str] = "Neutral"
    status: Optional[str] = "Received"
    # Admin Workspace fields
    assigned_to: Optional[str] = None
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    internal_notes: Optional[str] = None
    created_at: datetime
    ai_raw_output: Optional[str] = None
    validation_errors: Optional[str] = None

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    by_priority: dict
    by_source: dict
    by_status: dict
    volume_over_time: List[dict]
