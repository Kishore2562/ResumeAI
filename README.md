What is ResumeAI?
ResumeAI is a full-stack web application that analyzes a candidate’s resume against a job description and shows:
What skills are already strong
What skills are missing
How closely the resume matches the job role
What to learn next — with clear roadmaps and resources
⚠️ Important:
This project does NOT modify the original resume.
Instead, it generates a Skill Analysis Appendix that can be attached separately.
## 🚀 Key Features

- 📄 Upload resume (PDF / DOCX)
- 📝 Paste job description
- 🔍 Automatic skill extraction from resume and JD
- 📊 Visual skill match comparison (Before vs After)
- ➕ Add missing skills dynamically
- 🧭 Expandable learning roadmaps with clickable resources
- 🧑‍💼 Recruiter-view simulation (shortlisting perspective)
- 📑 Downloadable **Skill Analysis Appendix (PDF)**
- ❌ Original resume is **never modified**

---

#Why ResumeAI?

Many resumes fail not because candidates lack ability, but because:
- Job descriptions use specific skill keywords
- Candidates don’t know which skills are missing
- Learning paths are unclear or scattered
- Recruiters and ATS systems silently filter resumes

ResumeAI bridges this gap by **making the skill gap visible** and **guiding improvement step by step**.

---
 Tech Stack

# Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js (skill visualization)
- jsPDF (PDF generation)
- pdf.js (PDF resume parsing)
- Mammoth.js (DOCX parsing)

# Backend
- Python
- FastAPI
- Regex-based skill extraction

