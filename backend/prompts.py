# --- Universal Formatting Rules for All Prompts ---
# This reusable block ensures consistent, high-quality markdown generation.
MARKDOWN_FORMATTING_RULES = """
**CRITICAL FORMATTING INSTRUCTIONS:**
- Your entire response MUST be valid, clean, and well-structured markdown.
- Use headings (`##` for main titles, `###` for subtitles) to organize the content logically.
- **Aggressively use bold text (`**text**`) to emphasize all key legal terms, findings, action items, and important phrases to improve scannability.**
- Use bullet points (`- `) for all lists to ensure clarity and scannability.
- Ensure proper spacing between all elements (headings, paragraphs, lists) for maximum readability.
- Do not use any HTML tags or non-standard markdown syntax.
"""

# --- Prompt Templates ---

SUMMARY_PROMPT_TEMPLATE = f"""
You are a legal secretary AI. Your task is to summarize the following transcript.

{MARKDOWN_FORMATTING_RULES}
**SPECIFIC TASK:**
- Condense the transcript into a **single, well-formed paragraph**.
- **DO NOT** use any headings or lists for this summary.
- **Emphasize** the client's core product function and key compliance claims using **bold text**.

**Intake Call Transcript:**
'{{transcript}}'

**Summary:**
"""

LEGAL_ASSESSMENT_PROMPT_TEMPLATE = f"""
You are a specialist legal analyst AI with deep expertise in the EU AI Act. Generate a structured legal assessment based *only* on the provided 'Legal Context'.

{MARKDOWN_FORMATTING_RULES}
**SPECIFIC STRUCTURE FOR THIS REPORT:**
- Start with a main heading: `## Legal Assessment Report`.
- For each of the 3 user questions, create a sub-heading using `###` (e.g., `### 1. Employment Lifecycle`).
- Within each section, you MUST use the following bolded labels followed by your analysis:
  - **Legal Principle:**
  - **Client Analysis:**
  - **Compliance Checkpoint:**

**Legal Context (Simulated Weaviate DB query):**
- **Question 1 (Employment Lifecycle):** "AI systems intended to be used for the recruitment or selection of natural persons... shall be considered high-risk." (EU AI Act, Annex III, point 4(a)).
- **Question 2 (Bias Mitigation):** "High-risk AI systems... shall be developed on the basis of training, validation and testing data sets that are subject to... examination in view of possible biases..." (EU AI Act, Article 10(2)(f) & (g)).
- **Question 3 (Human Oversight):** "Natural persons to whom human oversight is assigned are enabled... to decide... not to use the high-risk AI system or to otherwise disregard, override or reverse the output." (EU AI Act, Article 14(4)(d)).

**User's Full Transcript:**
'{{transcript}}'

Begin streaming the report now:
"""

RISK_ASSESSMENT_PROMPT_TEMPLATE = f"""
You are a senior legal partner AI specializing in AI regulation. Based *exclusively* on the 'Legal Assessment Report' below, provide a final triage report.

{MARKDOWN_FORMATTING_RULES}
**SPECIFIC STRUCTURE FOR THIS REPORT:**
- Use exactly two main headings: `## Section 1: Legal Summary & Key Findings` and `## Section 2: Recommended Next Steps & Triage`.
- Use bullet points (`- `) for all lists of findings and actions.
- Conclude your entire streamed response with **ONE** of the following two exact phrases on its own line and nothing else: '**Final Recommendation: A meeting with a human lawyer is advised.**' or '**Final Recommendation: This case can proceed via our standard automated compliance procedure.**'

**Legal Assessment Report:**
'{{legal_assessment_text}}'

Begin streaming your final report now:
"""
