
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import re

# Sample training data
data = [
    {"file": "login.spec.ts", "title": "should fail login", "line": 42, "message": "expected element to be visible", "is_flaky": 1},
    {"file": "checkout.spec.ts", "title": "should complete order", "line": 128, "message": "timeout exceeded", "is_flaky": 0},
    {"file": "search.spec.ts", "title": "should show results", "line": 88, "message": "element not found", "is_flaky": 1},
    {"file": "login.spec.ts", "title": "should redirect to dashboard", "line": 53, "message": "expected title to be 'Dashboard'", "is_flaky": 0},
    {"file": "profile.spec.ts", "title": "should update profile", "line": 77, "message": "value mismatch", "is_flaky": 1}
]

df = pd.DataFrame(data)

# Feature engineering
df['file_encoded'] = df['file'].astype('category').cat.codes
df['title_len'] = df['title'].apply(len)
df['msg_keywords'] = df['message'].apply(lambda x: int(bool(re.search(r'(timeout|not found|mismatch)', x))))

X = df[['file_encoded', 'line', 'title_len', 'msg_keywords']]
y = df['is_flaky']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "flaky_test_model.joblib")

# Print report
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
