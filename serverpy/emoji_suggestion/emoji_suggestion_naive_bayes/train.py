"""
Naive Bayes Emoji Suggestion - Training Script
This script trains a Multinomial Naive Bayes classifier for emoji suggestion
"""

import os
import sys
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Add serverpy directory to sys.path to allow imports from emoji_suggestion
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVERPY_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))
if SERVERPY_DIR not in sys.path:
    sys.path.append(SERVERPY_DIR)

from emoji_suggestion.emoji_config import preprocess_text

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_DATA_PATH = os.path.join(BASE_DIR, "emoji_suggestion_dataset", "Train.csv")
MAPPING_PATH = os.path.join(BASE_DIR, "emoji_suggestion_dataset", "Mapping.csv")
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.joblib")
LABEL_MAPPING_PATH = os.path.join(MODEL_DIR, "label_mapping.joblib")


def load_emoji_mapping():
    """Load emoji label to emoji character mapping | Convert numeric labels → actual emojis"""
    mapping_df = pd.read_csv(MAPPING_PATH)
    emoji_map = dict(zip(mapping_df['number'], mapping_df['emoticons']))
    return emoji_map


def train_model():
    """Train Multinomial Naive Bayes classifier for emoji suggestion using TF-IDF features"""
    df = pd.read_csv(TRAIN_DATA_PATH)
    emoji_map = load_emoji_mapping()
    
    print(f"Total records loaded: {len(df)}")
    print("Class distribution:")
    print(df['Label'].value_counts())
    
    df['TEXT'] = df['TEXT'].apply(preprocess_text)
    df = df[df['TEXT'].str.len() > 0]
    
    X = df['TEXT'].values
    y = df['Label'].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # MultinomialNB as per documentation
    model = MultinomialNB(alpha=0.1)
    model.fit(X_train_vec, y_train)
    
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(emoji_map, LABEL_MAPPING_PATH)
    
    return model, vectorizer, emoji_map, accuracy


if __name__ == "__main__":
    model, vectorizer, emoji_map, accuracy = train_model()
    print(f"Model trained successfully. Accuracy: {accuracy:.4f}")
