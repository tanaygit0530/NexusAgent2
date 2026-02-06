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
            NexusAgent Triage Engine.
            Issue: {text}
            Active Incidents: {incidents_str}

            Task:
            1. Triage: Priority (High/Med/Low), Dept (Network/Hardware/Software/Access), Sentiment (Calm/Frustrated/Angry).
            2. Swarm Detection: If semantic similarity > 0.8 with an active incident, is_duplicate=true, parent_incident_id=matching_id.
            3. Input Completeness:
               - is_complete=true if text mentions app, system, or specific symptom.
               - is_complete=false if too vague (e.g. "help", "not working").
               - If false, provide ONE short clarification question.
            4. Spam Detection:
               - is_spam=true if text is gibberish, random chars, repeated symbols, or extremely short greetings with no intent (e.g. "hi").
               - reason: "random_text | repeated_messages | no_intent | pattern_abuse"

            Output JSON MUST follow this schema:
            {{
              "summary": "1-sentence",
              "category": "category",
              "priority": "High | Medium | Low",
              "department": "Network | Hardware | Software | Access",
              "sentiment": "Calm | Frustrated | Angry",
              "is_duplicate": true | false,
              "parent_incident_id": "TICK-ID | null",
              "ticket_role": "Primary | Follower",
              "similarity_score": 0-100,
              "swarm_reason": "why",
              "is_complete": true | false,
              "clarification_question": "question | null",
              "is_spam": true | false,
              "spam_reason": "reason | null"
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
            "summary": f"Review Required: {text[:50]}...",
            "category": "Other",
            "priority": "Medium",
            "department": "Software",
            "sentiment": "Calm",
            "confidence_score": 0.5,
            "similarity_score": 0,
            "swarm_reason": None,
            "is_complete": True,
            "clarification_question": None,
            "is_spam": is_spam,
            "spam_reason": spam_reason
        }

ai_service = AIService()
