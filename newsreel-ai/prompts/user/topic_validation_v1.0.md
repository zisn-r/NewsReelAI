# User Workflow: Topic Validation

**Version:** 1.0  
**Purpose:** Quick pre-check to ensure topic is valid before full processing  
**Input:** topic string  
**Output:** JSON validation result  
**Latency Target:** <1 second  

---

## Prompt Text

Evaluate this news topic for suitability before full processing:

TOPIC: "{topic}"

Assess:
1. Is this a real, newsworthy topic? (Not gibberish or nonsense)
2. Is this safe to cover? (Not hate speech, violence, illegal content)
3. Will you likely find credible news sources? (high/medium/low probability)
4. Is it current/recent news? (Published in last 30 days, ideally)

Return ONLY this JSON:

{
  "topic": "{topic}",
  "is_valid": true,
  "is_safe": true,
  "source_availability": "high",
  "confidence": 0.92,
  "refined_topic": "{topic}",
  "reasoning": "This is a current, newsworthy topic with abundant credible sources available."
}

If topic is invalid:
{
  "topic": "{topic}",
  "is_valid": false,
  "is_safe": false,
  "source_availability": "low",
  "confidence": 0.98,
  "refined_topic": "Try asking about technology news or latest technology developments",
  "reasoning": "This appears to be gibberish or not a real topic. No credible sources exist."
}
