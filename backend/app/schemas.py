from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    RECEIVED = "Received"
    PROCESSING = "Processing"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"

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
    sentiment: str
    status: str
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
