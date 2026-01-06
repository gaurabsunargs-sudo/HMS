import os
import joblib
import numpy as np
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'vectorizer.joblib')
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, 'label_mapping.joblib')

import sys
# Add serverpy directory to sys.path to allow imports from emoji_suggestion
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVERPY_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
if SERVERPY_DIR not in sys.path:
    sys.path.append(SERVERPY_DIR)

from emoji_suggestion.emoji_config import preprocess_text

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