# Naive Bayes Emoji Suggestion

This module provides emoji suggestions using a Multinomial Naive Bayes classifier trained on social media text data.

## Features

- **Fast & Lightweight**: Model size only 1.6 MB (38x smaller than Random Forest!)
- **Probabilistic**: Returns true probability scores using Bayes theorem
- **TF-IDF Vectorization**: Captures word importance with bigrams
- **Top-N Predictions**: Returns multiple emoji suggestions with probability scores
- **Trained on 140K+ samples**: Real social media text data

## How It Works

The Naive Bayes algorithm calculates emoji probabilities using Bayes theorem:

```
P(emoji|text) = P(text|emoji) × P(emoji) / P(text)
```

Where:
- `P(emoji|text)` is the probability of an emoji given the text
- `P(text|emoji)` is the likelihood of the text given the emoji class
- `P(emoji)` is the prior probability of the emoji
- `P(text)` is the evidence (normalizing constant)

## Files

- `train.py` - Training script with probability examples
- `predict.py` - Prediction service
- `model.joblib` - Trained Naive Bayes model (1.6 MB)
- `vectorizer.joblib` - TF-IDF vectorizer (186 KB)
- `label_mapping.joblib` - Emoji label mapping

## Usage

### Training

```bash
python emoji_suggestion_naive_bayes/train.py
```

### Prediction (Standalone)

```python
from emoji_suggestion_naive_bayes import predict_emoji

# Get top 5 emoji suggestions
predictions = predict_emoji("I am so happy today!", top_n=5)

for pred in predictions:
    print(f"{pred['emoji']} - {pred['probability']:.2%}")
```

### Prediction (API)

```bash
curl -X POST http://localhost:8000/emoji-suggest/naive-bayes \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so happy today!", "top_n": 5}'
```

## Model Details

- **Algorithm**: Multinomial Naive Bayes
- **Smoothing**: Laplace smoothing (alpha=0.1)
- **Features**: 5000 TF-IDF features (unigrams + bigrams) with sublinear scaling
- **Training Data**: 112,001 samples
- **Test Data**: 28,001 samples
- **Emoji Classes**: 20

## Advantages

✅ **Very Fast**: Training and prediction are extremely quick  
✅ **Small Model**: Only 1.6 MB vs 61 MB for Random Forest  
✅ **True Probabilities**: Returns actual probability scores  
✅ **Interpretable**: Easy to understand how predictions are made  
✅ **Works Great with Text**: Naive Bayes is particularly effective for text classification

## Supported Emojis

😜, 📸, 😍, 😂, 😉, 🎄, 📷, 🔥, 😘, ❤, 😁, 🇺🇸, ☀, ✨, 💙, 💕, 😎, 😊, 💜, 💯
