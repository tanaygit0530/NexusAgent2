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
            
            # --- Department Validation Agent ---
            validated_result = await self.validate_department(text, result_json)
            
            print("DEBUG: API Extraction + Validation Successful")
            return validated_result, response.text, None
            
        except Exception as e:
            print(f"DEBUG: AI Extraction Error: {str(e)}")
            logging.error(f"AI Extraction Error: {str(e)}")
            # FAIL-SAFE: Return something so the ticket is still created
            return self._get_demo_data(text), "API_ERROR_FALLBACK", f"AI Error: {str(e)}"

    async def validate_department(self, text: str, initial_result: dict):
        """
        Validates the department assignment using a secondary AI pass or rule check.
        """
        import asyncio
        prompt = f"""
        You are a Department Validation Engine.
        
        Issue: {text}
        AI-assigned Department: {initial_result.get('department')}
        
        Rules:
        - Validate department using keyword-rule mapping:
          - Network: Internet, WiFi, VPN, connectivity
          - Hardware: Laptop, physical device
          - Software: Apps, website, OS bugs
          - Access: Login, password, permissions
        - If high-confidence mismatch -> auto-reroute
        - If low-confidence mismatch -> keep department but flag
        
        Output (JSON ONLY):
        {{
          "is_misrouted": true | false,
          "correct_department": "Network | Hardware | Software | Access",
          "confidence": 0.0 - 1.0,
          "action": "reroute | keep | flag_for_human"
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
                timeout=5.0
            )
            validation_data = json.loads(response.text)
            
            # Update initial result based on validation
            if validation_data.get("action") == "reroute":
                initial_result["department"] = validation_data.get("correct_department")
                initial_result["reassigned_by"] = "AI"
                initial_result["department_confidence"] = int(validation_data.get("confidence", 0) * 100)
            elif validation_data.get("action") == "flag_for_human":
                initial_result["is_flagged"] = "true"
                initial_result["department_confidence"] = int(validation_data.get("confidence", 0) * 100)
            else:
                initial_result["is_flagged"] = "false"
                initial_result["department_confidence"] = int(validation_data.get("confidence", 1.0) * 100)
                
            return initial_result
        except Exception as e:
            print(f"DEBUG: Validation Error skip: {str(e)}")
            return initial_result

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
