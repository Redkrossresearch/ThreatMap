import asyncio
import logging
import google.generativeai as genai
from core.config import settings

logger = logging.getLogger(__name__)

class GeneratorService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        if self.api_key and self.api_key.startswith("AIza"):
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
            logger.info("GeneratorService configured with Gemini model.")
        else:
            logger.warning("Gemini API key not set for GeneratorService.")

    async def generate_yara_rule(self, data: dict) -> str:
        if not self.model:
            return "rule FallbackRule {\n    condition:\n        true\n}"

        prompt = f"""
You are a cybersecurity expert. Generate a strict and syntactically valid YARA rule based on the following malware intelligence.
Return ONLY the raw YARA rule string. No markdown block, no explanations.

Inputs:
File Hash: {data.get("file_hash", "N/A")}
Malware Name: {data.get("malware_name", "Unknown")}
Malware Family: {data.get("malware_family", "Unknown")}
IOC Information: {data.get("ioc_information", "N/A")}
Behavior Description: {data.get("behavior_description", "N/A")}
"""
        try:
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(None, self.model.generate_content, prompt),
                timeout=15.0
            )
            rule = response.text.strip()
            if rule.startswith("```"):
                rule = "\n".join(rule.split("\n")[1:-1])
            return rule
        except Exception as e:
            logger.error(f"YARA generation failed: {e}")
            return "rule ErrorRule {\n    condition:\n        true\n}"

    async def generate_sigma_rule(self, data: dict) -> str:
        if not self.model:
            return "title: Fallback Sigma Rule\nlogsource:\n    product: windows\ndetection:\n    condition: all of them"

        prompt = f"""
You are a cybersecurity expert. Generate a strict and syntactically valid Sigma YAML rule based on the following threat intelligence.
Return ONLY the raw YAML string. No markdown block, no explanations.

Inputs:
IP Address: {data.get("ip_address", "N/A")}
Domain: {data.get("domain", "N/A")}
URL: {data.get("url", "N/A")}
CVE ID: {data.get("cve_id", "N/A")}
Threat Actor: {data.get("threat_actor", "N/A")}
Attack Description: {data.get("attack_description", "N/A")}
"""
        try:
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(None, self.model.generate_content, prompt),
                timeout=15.0
            )
            rule = response.text.strip()
            if rule.startswith("```"):
                rule = "\n".join(rule.split("\n")[1:-1])
            return rule
        except Exception as e:
            logger.error(f"Sigma generation failed: {e}")
            return "title: Error generating rule\nlogsource:\n    product: windows\ndetection:\n    condition: all of them"

generator_service = GeneratorService()
