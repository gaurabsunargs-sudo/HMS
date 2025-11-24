import os
import pandas as pd
import joblib
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


def train_disease_prediction_model():
    """Train Random Forest classifier (100 trees) for disease prediction based on symptom features"""
    df = pd.read_csv(DATASET_PATH)
    
    X = df.drop('prognosis', axis=1)
    y = df['prognosis']
    
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)
    
    return model, label_encoder, accuracy


if __name__ == "__main__":
    train_disease_prediction_model()
