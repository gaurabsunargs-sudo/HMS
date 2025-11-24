import os
import json
from typing import List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# Import emoji suggestion module (Naive Bayes only)
from emoji_suggestion.emoji_suggestion_naive_bayes import predict as nb_predict
from emoji_suggestion.emoji_suggestion_naive_bayes import train as nb_train
from emoji_suggestion.emoji_config import (
    EMOJI_NAMES,
    EMOTION_EMOJI_GROUPS,
    get_emoji_name,
    get_emotion_emojis,
    detect_emotion
)


# Disease Prediction Paths
DATASET_PATH = os.path.join(os.path.dirname(__file__), "disease_prediction/disease-prediction-dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "disease_prediction/model.joblib")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "disease_prediction/label_encoder.joblib")
SYMPTOMS_PATH = os.path.join(os.path.dirname(__file__), "disease_prediction/symptoms.json")


class PredictRequest(BaseModel):
    symptoms: List[str]

class SuggestRequest(BaseModel):
    selected_symptoms: List[str]

class EmojiPredictRequest(BaseModel):
    text: str
    top_n: Optional[int] = 5


def get_symptom_suggestions(selected_symptoms: List[str], limit: int = 10) -> List[str]:
    try:
        df = pd.read_csv(DATASET_PATH)
        feature_columns = [c for c in df.columns if c != "prognosis"]
        
        mask = df[selected_symptoms].any(axis=1)
        relevant_rows = df[mask]
        
        if relevant_rows.empty:
            return []
        
        symptom_scores = {}
        
        for symptom in feature_columns:
            if symptom in selected_symptoms:
                continue
                
            co_occurrence_count = relevant_rows[symptom].sum()
            
            if co_occurrence_count > 0:
                total_relevant_cases = len(relevant_rows)
                relevance_score = co_occurrence_count / total_relevant_cases
                
                overall_frequency = df[symptom].sum() / len(df)
                frequency_boost = min(overall_frequency * 2, 0.5)
                
                final_score = relevance_score + frequency_boost
                symptom_scores[symptom] = final_score
        
        sorted_symptoms = sorted(symptom_scores.items(), key=lambda x: x[1], reverse=True)
        return [symptom for symptom, score in sorted_symptoms[:limit]]
        
    except Exception as e:
        print(f"Error in symptom suggestion: {e}")
        return []


def train_and_save_model():
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError("Dataset not found")

    df = pd.read_csv(DATASET_PATH)

    if "prognosis" not in df.columns:
        raise ValueError("Dataset must contain 'prognosis' column")

    feature_columns = [c for c in df.columns if c != "prognosis"]

    encoder = LabelEncoder() 
    y = encoder.fit_transform(df["prognosis"].astype(str).str.strip())

    X = (
        df[feature_columns]
        .apply(pd.to_numeric, errors="coerce")
        .fillna(0)
        .clip(lower=0, upper=1)
        .astype(int)
    )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    with open(SYMPTOMS_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f)


def ensure_model():
    if not (os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(SYMPTOMS_PATH)):
        train_and_save_model()

ensure_model()

app = FastAPI(title="ML Service - Disease & Emoji Prediction", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/symptoms")
def get_symptoms():
    with open(SYMPTOMS_PATH, "r", encoding="utf-8") as f:
        symptoms = json.load(f)
    return {"symptoms": symptoms}

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        model = joblib.load(MODEL_PATH)
        encoder: LabelEncoder = joblib.load(ENCODER_PATH)
        with open(SYMPTOMS_PATH, "r", encoding="utf-8") as f:
            symptoms_list = json.load(f)
        
        input_vector = [1 if s in set(req.symptoms) else 0 for s in symptoms_list]
        X = pd.DataFrame([input_vector], columns=symptoms_list)

        pred_idx = model.predict(X)[0]
        predicted_disease = str(encoder.inverse_transform([pred_idx])[0])

        return {"predicted_disease": predicted_disease}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/suggest-symptoms")
def suggest_symptoms(req: SuggestRequest):
    try:
        suggestions = get_symptom_suggestions(req.selected_symptoms, limit=15)
        return {"suggested_symptoms": suggestions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# EMOJI SUGGESTION ENDPOINTS (Naive Bayes)
# ============================================================================

@app.post("/emoji-suggest")
@app.post("/emoji-suggest/naive-bayes")
def emoji_suggest(req: EmojiPredictRequest):
    """
    Suggest emojis based on text using Naive Bayes
    Returns 3-5 emojis for the same detected emotion with emoji names
    """
    try:
        # Get predictions from Naive Bayes model
        predictions = nb_predict.predict_emoji(req.text, top_n=5)
        
        if not predictions:
            raise HTTPException(status_code=500, detail="Failed to get emoji predictions")
        
        # Get top predicted emoji and detect its emotion
        top_emoji = predictions[0]['emoji']
        detected_emotion = detect_emotion(top_emoji)
        
        # Get 3-5 emojis for the detected emotion
        emotion_emojis = get_emotion_emojis(detected_emotion) or [top_emoji]
        
        # Create suggestions with emoji names
        suggestions = [
            {
                "emoji": emoji,
                "description": get_emoji_name(emoji),
                "emotion": detected_emotion
            }
            for emoji in emotion_emojis[:5]
        ]
        
        return {
            "success": True,
            "algorithm": "Naive Bayes",
            "emotion": detected_emotion,
            "confidence": predictions[0]['probability'],
            "suggestions": suggestions,
            "text": req.text,
            "raw_predictions": predictions  # Keep for debugging
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emoji suggestion failed: {str(e)}")


@app.post("/emoji-train")
@app.post("/emoji-train/naive-bayes")
def train_emoji_model():
    """Train the Naive Bayes emoji suggestion model"""
    try:
        model, vectorizer, emoji_map, accuracy = nb_train.train_model()
        return {
            "status": "success",
            "algorithm": "Naive Bayes",
            "accuracy": float(accuracy),
            "num_emojis": len(emoji_map),
            "message": "Naive Bayes emoji model trained successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
