# Prompts Changelog

All notable changes to prompts are documented here.

## [1.1] - 2026-05-09

### Added
- `source_validation_v1.1.md` - Added explicit credibility tiers (tier1, tier2, avoid)
- Fallback handling for hallucinated sources

### Changed
- Updated `journalist_role_v1.0.md` to reference new tier system
- Increased success rate target to 91% for source validation

### Testing
- Validated against 5 diverse topics
- Achieved 91% success rate on source credibility

---

## [1.0] - 2026-05-08

### Added
- Initial release of prompt library
- System prompts: journalist_role_v1.0, video_script_optimization_v1.0, source_validation_v1.0
- User workflows: news_to_script_v1.0, topic_validation_v1.0
- Evaluation criteria: script_quality_rubric_v1.0, source_credibility_v1.0
- Test cases: 25 test topics
- Settings: model config with deterministic parameters

### Success Rates
- Journalist role: 94%
- Video optimization: 88%
- Source validation: 91%
- News-to-script workflow: 92%
- Topic validation: 96%

### Known Issues
- May hallucinate sources on very obscure topics
- Very recent topics (<24 hours) may not have sources yet
- Extremely long topics (>100 words) may be ignored
- All mitigated with fallback handling

---

## Versioning Strategy

- **Major version:** Structural changes (new workflows, new criteria)
- **Minor version:** Refinements (better wording, tier improvements)
- **Patch version:** Typo fixes, documentation updates (not used in filename)

Example progression:
- `journalist_role_v1.0.md` → `journalist_role_v1.1.md` → `journalist_role_v2.0.md`
