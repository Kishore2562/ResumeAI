from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
import PyPDF2, re

app = FastAPI(title="ResumeAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SKILLS = {
    "Python": ["python"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "HTML": ["html"],
    "CSS": ["css"],
    "SQL": ["sql", "mysql", "postgres"],
    "Git": ["git", "github"],
    "FastAPI": ["fastapi"],
    "Docker": ["docker"],
    "AWS": ["aws"],
    "MongoDB": ["mongodb"],
    "React": ["react"]
}

LEARNING_PATHS = {
    "AWS": {
        "roadmap": ["EC2 & IAM", "S3", "RDS", "Deploy full-stack app"],
        "links": [
            "https://aws.amazon.com/ec2/",
            "https://aws.amazon.com/s3/",
            "https://aws.amazon.com/rds/",
            "https://aws.amazon.com/getting-started/"
        ]
    },
    "Docker": {
        "roadmap": ["Containers", "Dockerfile", "Images", "Compose"],
        "links": [
            "https://docs.docker.com/get-started/",
            "https://docs.docker.com/engine/reference/builder/",
            "https://docs.docker.com/storage/",
            "https://docs.docker.com/compose/"
        ]
    },
    "MongoDB": {
        "roadmap": ["Basics", "CRUD", "Indexes", "Mini Project"],
        "links": [
            "https://www.mongodb.com/docs/",
            "https://www.mongodb.com/docs/manual/crud/",
            "https://www.mongodb.com/docs/manual/indexes/",
            "https://www.mongodb.com/developer/"
        ]
    },
    "React": {
        "roadmap": ["JS ES6", "Components", "Hooks", "Mini Project"],
        "links": [
            "https://javascript.info/",
            "https://react.dev/learn",
            "https://react.dev/reference/react",
            "https://react.dev/learn/tutorial-tic-tac-toe"
        ]
    }
}

def extract_text(file):
    text = ""
    if file.filename.lower().endswith(".pdf"):
        reader = PyPDF2.PdfReader(file.file)
        for page in reader.pages:
            text += page.extract_text() or ""
    else:
        doc = Document(file.file)
        for p in doc.paragraphs:
            text += p.text + " "
    return text.lower()

def extract_skills(text):
    found = set()
    for skill, keys in SKILLS.items():
        for k in keys:
            if re.search(rf"\b{re.escape(k)}\b", text):
                found.add(skill)
    return sorted(found)

@app.post("/analyze/")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_skills = extract_skills(extract_text(file))
    jd_skills = extract_skills(job_description.lower())

    matched = sorted(set(resume_skills) & set(jd_skills))
    missing = sorted(set(jd_skills) - set(resume_skills))

    learning = {
        s: LEARNING_PATHS.get(
            s,
            {
                "roadmap": ["Learn basics", "Build mini project"],
                "links": ["https://www.google.com/search?q=" + s]
            }
        )
        for s in missing
    }

    return {
        "extracted_skills": resume_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "learning_paths": learning
    }