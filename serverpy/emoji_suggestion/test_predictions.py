from emoji_suggestion_naive_bayes.predict import predict_emoji

print("=" * 60)
print("Testing Emoji Predictions")
print("=" * 60)

test_cases = [
    "i am sad",
    "i am happy",
    "i love you",
    "feeling great today",
    "this is terrible"
]

for text in test_cases:
    print(f"\nText: '{text}'")
    predictions = predict_emoji(text, top_n=3)
    for i, pred in enumerate(predictions, 1):
        print(f"  {i}. {pred['emoji']} - {pred['probability']:.2%} (label {pred['label']})")
