
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import re

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Add this to handle CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] to be specific
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("flaky_test_model.joblib")  # Ensure this file is in the same directory

class TestFailure(BaseModel):
    file: str
    title: str
    line: int
    message: str

@app.post("/predict")
def predict_flaky(data: TestFailure):
    df = pd.DataFrame([{
        "file": data.file,
        "title": data.title,
        "line": data.line,
        "message": data.message,
        "file_encoded": hash(data.file) % 1000,
        "title_len": len(data.title),
        "msg_keywords": int(bool(re.search(r"(timeout|not found|mismatch)", data.message)))
    }])

    features = df[["file_encoded", "line", "title_len", "msg_keywords"]]
    prediction = model.predict(features)[0]
    return { "is_flaky": bool(prediction) }

# Database connection example for login
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginRequest):
    conn = mysql.connector.connect(
        host="mysql_members",
        user="memberuser",
        password="memberpass",
        database="Members"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Credential WHERE email=%s", (data.email,))
    user = cursor.fetchone()

    if not user or user["password_hash"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful"}
