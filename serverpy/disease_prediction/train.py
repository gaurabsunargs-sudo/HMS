import os
import pandas as pd
import joblib
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import warnings

warnings.filterwarnings('ignore')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "disease-prediction-dataset.csv")
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.joblib")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.joblib")
SYMPTOMS_PATH = os.path.join(SCRIPT_DIR, "symptoms.json")


def train_disease_prediction_model():
    """Train Random Forest classifier (300 trees) for disease prediction based on symptom features"""
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    
    if "prognosis" not in df.columns:
        raise ValueError("Dataset must contain 'prognosis' column")

    feature_columns = [c for c in df.columns if c != "prognosis"]
    
    # Process Labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(df['prognosis'].astype(str).str.strip())
    
    # Process Features
    X = (
        df[feature_columns]
        .apply(pd.to_numeric, errors="coerce")
        .fillna(0)
        .clip(lower=0, upper=1)
        .astype(int)
    )
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Train Model (300 estimators for better accuracy)
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Save artifacts
    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)
    with open(SYMPTOMS_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f)
    
    print(f"Model trained successfully. Accuracy: {accuracy:.4f}")
    return model, label_encoder, accuracy


if __name__ == "__main__":
    train_disease_prediction_model()
