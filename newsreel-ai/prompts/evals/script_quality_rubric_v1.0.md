# Evaluation Rubric: Script Quality

**Version:** 1.0  
**Purpose:** Grade generated scripts on quality criteria  
**Target:** Score >= 70 to pass, >= 85 for excellent  

---

## Rubric

| Criterion | Weight | 0-25 | 25-50 | 50-75 | 75-100 |
|-----------|--------|------|-------|-------|--------|
| **Accuracy** | 30% | Facts wrong, sources fake | Some facts wrong | Minor errors | All facts verified ✅ |
| **Engagement** | 25% | Boring, no hook | Weak start | Good hook, could punch up | Compelling throughout ✅ |
| **Structure** | 20% | No clear flow | Unclear progression | Good flow | Perfect hook→resolution ✅ |
| **Conciseness** | 15% | Way too long/short | Off by 50+ words | 320-350 words | Exactly 300-350 ✅ |
| **Visual Language** | 10% | Abstract, hard to animate | Some visual moments | Mostly visual | Cinematic throughout ✅ |

## Scoring

Calculate weighted score:
```
score = (accuracy_score * 0.30) + 
        (engagement_score * 0.25) + 
        (structure_score * 0.20) + 
        (conciseness_score * 0.15) + 
        (visual_score * 0.10)
```

### Pass/Fail

- **70-79:** ✅ PASS (acceptable)
- **80-89:** ✅ PASS (good)
- **90-100:** ✅ PASS (excellent)
- **<70:** ❌ FAIL (needs revision)

## Example Evaluation

**Topic:** "AI Regulation in Europe"

| Criterion | Score | Notes |
|-----------|-------|-------|
| Accuracy | 28/30 | Facts correct, all sources verified |
| Engagement | 21/25 | Strong hook, could be punchier |
| Structure | 18/20 | Clear flow, ending slightly weak |
| Conciseness | 15/15 | Exactly 325 words |
| Visual Language | 9/10 | Cinematic, one phrase unclear |
| **TOTAL** | **91/100** | ✅ EXCELLENT PASS |
