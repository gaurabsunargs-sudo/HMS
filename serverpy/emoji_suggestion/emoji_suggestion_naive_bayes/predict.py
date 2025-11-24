import os
import joblib
import numpy as np
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer.joblib')
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, 'label_mapping.joblib')

_model = None
_vectorizer = None
_emoji_map = None


def load_model():
    """Load the trained Naive Bayes model and vectorizer"""
    global _model, _vectorizer, _emoji_map
    
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Please train the model first.")
        
        _model = joblib.load(MODEL_PATH)
        _vectorizer = joblib.load(VECTORIZER_PATH)
        _emoji_map = joblib.load(LABEL_ENCODER_PATH)
    
    return _model, _vectorizer, _emoji_map


def preprocess_text(text: str) -> str:
    """Preprocess text: lowercase, remove mentions and hashtags"""
    if not text:
        return ""
    text = str(text).lower()
    text = text.replace('@user', '')
    text = text.replace('#', '')
    return text.strip()


def predict_emoji(text: str, top_n: int = 5) -> List[Dict]:
    """
    Predict emoji suggestions using Naive Bayes: P(emoji|text) = P(text|emoji) × P(emoji) / P(text)
    Returns list of dicts with emoji, probability, confidence, and label
    """
    model, vectorizer, emoji_map = load_model()
    processed_text = preprocess_text(text)
    
    if not processed_text:
        return []
    
    text_vec = vectorizer.transform([processed_text])
    probabilities = model.predict_proba(text_vec)[0]
    top_indices = np.argsort(probabilities)[::-1][:top_n]
    
    results = []
    for idx in top_indices:
        label = model.classes_[idx]
        probability = probabilities[idx]
        emoji = emoji_map.get(label, "❓")
        
        results.append({
            "emoji": emoji,
            "probability": float(probability),
            "confidence": float(probability),
            "label": int(label)
        })
    
    return results


def predict_single_emoji(text: str) -> str:
    """Predict single best emoji for given text"""
    predictions = predict_emoji(text, top_n=1)
    if predictions:
        return predictions[0]["emoji"]
    return "❓"


if __name__ == "__main__":
    test_texts = [
        "I am so happy today!",
        "This is amazing and I love it",
        "Feeling sad and lonely"
    ]
    
    for text in test_texts:
        predictions = predict_emoji(text, top_n=3)
        print(f"\n{text}")
        for i, pred in enumerate(predictions, 1):
            print(f"  {i}. {pred['emoji']} ({pred['probability']:.2%})")
