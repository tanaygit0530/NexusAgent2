import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from ..schemas import AIExtractionResult
import logging

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash') 

    async def analyze_issue(self, text: str):
        key = os.getenv("GOOGLE_API_KEY")
        print(f"DEBUG: Entering analyze_issue. Key found: '{key[:10]}...'")
        
        # DEMO FALLBACK: If key is placeholder or doesn't start with AIza (basic check)
        if not key or key == "your_gemini_api_key_here" or key.startswith("your_"):
            print("DEBUG: Using demo fallback (Placeholder key)")
            return self._get_demo_data(text), "DEMO_MODE_NO_API_KEY", "Gemini API key not configured. Using demo fallback."

        try:
            import asyncio
            print(f"DEBUG: Calling Gemini API for: {text[:50]}...")
            try:
                prompt = f"""
                Analyze the following IT support issue and return a JSON object.
                Issue: {text}

                Classification Rules:
                Priority:
                - High: System down, business blocked, repeated failures, urgent keywords
                - Medium: Functional issue with workaround
                - Low: Minor issues, cosmetic, informational requests

                Department:
                - Network: Internet, WiFi, VPN, slow network, connectivity
                - Hardware: Laptop, desktop, printer, physical device issues
                - Software: Applications, OS, website, email client, bugs
                - Access: Login, password, permissions, account lock

                Sentiment:
                - Calm: Neutral wording, no urgency
                - Frustrated: Repeated issues, delays, mild urgency
                - Angry: Strong language, escalation, threats, caps

                JSON Format:
                {{
                  "summary": "1-sentence summary",
                  "category": "Generic category",
                  "priority": "High | Medium | Low",
                  "department": "Network | Hardware | Software | Access",
                  "sentiment": "Calm | Frustrated | Angry",
                  "confidence_score": 0.0 - 1.0
                }}
                """
                response = await asyncio.wait_for(
                    self.model.generate_content_async(
                        prompt,
                        generation_config=genai.types.GenerationConfig(
                            response_mime_type="application/json",
                        )
                    ),
                    timeout=10.0
                )
            except asyncio.TimeoutError:
                raise Exception("AI Request Timed Out")
            
            result_json = json.loads(response.text)
            validated_result = AIExtractionResult(**result_json)
            print("DEBUG: API Extraction Successful")
            return validated_result.model_dump(), response.text, None
            
        except Exception as e:
            print(f"DEBUG: AI Extraction Error: {str(e)}")
            logging.error(f"AI Extraction Error: {str(e)}")
            # FAIL-SAFE: Return something so the ticket is still created
            return self._get_demo_data(text), "API_ERROR_FALLBACK", f"AI Error: {str(e)}"

    def _get_demo_data(self, text: str):
        return {
            "summary": f"Review Required: {text[:50]}...",
            "category": "Other",
            "priority": "Medium",
            "department": "Software",
            "sentiment": "Calm",
            "confidence_score": 0.5
        }

ai_service = AIService()
