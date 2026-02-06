import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from ..schemas import AIExtractionResult
import logging

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

import traceback

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash') 

    async def analyze_issue(self, text: str, active_incidents: list = None):
        key = os.getenv("GOOGLE_API_KEY")
        print(f"DEBUG: Entering analyze_issue. Key found: '{key[:10]}...'")
        
        # DEMO FALLBACK: If key is placeholder or doesn't start with AIza (basic check)
        if not key or key == "your_gemini_api_key_here" or key.startswith("your_"):
            print("DEBUG: Using demo fallback (Placeholder key)")
            return self._get_demo_data(text), "DEMO_MODE_NO_API_KEY", "Gemini API key not configured. Using demo fallback."

        try:
            import asyncio
            print(f"DEBUG: Calling Unified Gemini AI Triage for: {text[:50]}...")
            
            incidents_str = "None"
            if active_incidents:
                incidents_str = json.dumps([{ 
                    "id": i.get("ticket_id"), 
                    "summary": i.get("summary")
                } for i in active_incidents])

            prompt = f"""
            You are a Spam Detection and State Enforcement Agent for an IT Support Ticketing System.
            Your responsibility is to identify spam tickets and immediately enforce a non-active system state.

            User Issue: {text}
            Active Incidents: {incidents_str}

            ### SPAM DETECTION RULES
            Classify a ticket as spam if it contains:
            - Random or gibberish text
            - Repeated characters or symbols
            - No actionable IT intent
            - Repeated submissions in short time

            ### STATE ENFORCEMENT (CRITICAL)
            If a ticket is classified as spam, you MUST:
            1. Mark the ticket as spam (is_spam = true)
            2. Immediately override ticket fields:
               - status → "Cancelled"
               - priority → "None"
               - department → null
               - sentiment → null
               - is_active → false
               - reason → "random_text | repeated_messages | no_intent"

            ### LEGITIMATE TICKET TRIAGE
            If NOT SPAM:
            - is_spam = false
            - is_active = true
            - status = ("Waiting" if info missing, else "Processing")
            - priority = High | Medium | Low
            - department = Network | Hardware | Software | Access
            - sentiment = Calm | Frustrated | Angry
            - Swarm Detection: If similarity > 0.8 with an active incident, is_duplicate=true.

            ### HUMAN HANDOFF SUMMARY
            Generate a structured summary for a human agent:
            - handoff_summary: Short, technical description of the core problem.
            - ai_attempts: What the AI system has checked/performed (e.g., "Classified as Network issue, checked for duplicates, sentiment analyzed").
            - next_best_action: Logical next step for a human (e.g., "Verify router connectivity", "Reset user password").

            Output JSON MUST follow this schema:
            {{
              "is_spam": true | false,
              "enforced": true | false,
              "final_status": "Cancelled | Waiting | Processing",
              "reason": "reason | null",
              "summary": "1-sentence",
              "handoff_summary": "structured summary",
              "ai_attempts": "actions taken",
              "next_best_action": "step for human",
              "category": "category",
              "priority": "High | Medium | Low | None",
              "department": "Network | Hardware | Software | Access | null",
              "sentiment": "Calm | Frustrated | Angry | null",
              "is_active": true | false,
              "is_complete": true | false,
              "clarification_question": "question | null",
              "is_duplicate": true | false,
              "parent_incident_id": "TICK-ID | null",
              "ticket_role": "Primary | Follower",
              "similarity_score": 0-100,
              "swarm_reason": "why"
            }}
            """
            
            try:
                response = await asyncio.wait_for(
                    self.model.generate_content_async(
                        prompt,
                        generation_config=genai.types.GenerationConfig(
                            response_mime_type="application/json",
                        )
                    ),
                    timeout=15.0
                )
            except asyncio.TimeoutError:
                raise Exception("AI Request Timed Out")
            
            result_json = json.loads(response.text)
            print("DEBUG: Unified AI Extraction Successful")
            return result_json, response.text, None
            
        except Exception as e:
            print(f"DEBUG: AI Extraction Error: {str(e)}")
            traceback.print_exc()
            logging.error(f"AI Extraction Error: {str(e)}")
            return self._get_demo_data(text), "API_ERROR_FALLBACK", f"AI Error: {str(e)}"

    def _get_demo_data(self, text: str):
        # BASIC FALLBACK SPAM CHECK
        is_spam = False
        spam_reason = None
        if len(text.strip()) < 3 or text.lower().strip() == "hi":
            is_spam = True
            spam_reason = "no_intent"
        elif any(c in text for c in "!@#$%^&*") and len(text) > 10 and " " not in text:
            is_spam = True
            spam_reason = "random_text"

        return {
            "is_spam": is_spam,
            "enforced": is_spam,
            "final_status": "Cancelled" if is_spam else "Processing",
            "reason": spam_reason,
            "summary": f"Review Required: {text[:50]}...",
            "handoff_summary": "Manual review of detected issue." if not is_spam else "Spam identified and blocked.",
            "ai_attempts": "Demo fallback used. Basic pattern matching performed." if not is_spam else "Spam detection patterns applied.",
            "next_best_action": "Verify user details and technical context." if not is_spam else "No further action needed.",
            "category": "Other",
            "priority": "None" if is_spam else "Medium",
            "department": None if is_spam else "Software",
            "sentiment": None if is_spam else "Calm",
            "is_active": not is_spam,
            "is_complete": True,
            "clarification_question": None,
            "is_duplicate": False,
            "parent_incident_id": None,
            "ticket_role": "Primary",
            "similarity_score": 0,
            "swarm_reason": None
        }

ai_service = AIService()
