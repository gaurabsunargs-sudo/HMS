import pandas as pd
from sklearn.model_selection import train_test_split
import os

EMOTION_TO_EMOJI = {
    'sadness': '😢',
    'love': '❤️',
    'happiness': '😊',
    'worry': '😟',
    'hate': '😠',
    'fun': '🎉',
    'enthusiasm': '🤩',
    'relief': '😌',
    'surprise': '😲',
    'empty': '😐',
    'boredom': '😴',
    'neutral': '😐',
    'anger': '😡',
}


def prepare_emoji_dataset():
    """Load, clean, and prepare text-to-emoji dataset with train/test split"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    df = pd.read_csv(os.path.join(script_dir, 'text_to_emoji_datasets.csv'))
    
    df = df.dropna(subset=['content', 'sentiment'])
    df = df[df['sentiment'].str.strip() != '']
    df['emoji'] = df['sentiment'].map(EMOTION_TO_EMOJI)
    df = df.dropna(subset=['emoji'])
    
    unique_emojis = sorted(df['emoji'].unique())
    emoji_to_label = {emoji: idx for idx, emoji in enumerate(unique_emojis)}
    df['label'] = df['emoji'].map(emoji_to_label)
    
    final_df = df[['content', 'label', 'emoji', 'sentiment']].copy()
    final_df.columns = ['TEXT', 'Label', 'Emoji', 'Sentiment']
    
    train_df, test_df = train_test_split(
        final_df, 
        test_size=0.2, 
        random_state=42,
        stratify=final_df['Label']
    )
    
    mapping_df = pd.DataFrame({
        'emoticons': unique_emojis,
        'number': range(len(unique_emojis)),
        'sentiment': [list(EMOTION_TO_EMOJI.keys())[list(EMOTION_TO_EMOJI.values()).index(e)] for e in unique_emojis]
    })
    
    output_dir = os.path.join(script_dir, 'emoji_suggestion_dataset')
    os.makedirs(output_dir, exist_ok=True)
    
    train_df[['TEXT', 'Label']].to_csv(f'{output_dir}/Train.csv', index=True)
    test_df[['TEXT', 'Label']].to_csv(f'{output_dir}/Test.csv', index=True)
    mapping_df.to_csv(f'{output_dir}/Mapping.csv', index=True)
    final_df.to_csv(f'{output_dir}/Full_Dataset.csv', index=True)
    
    return train_df, test_df, mapping_df


if __name__ == "__main__":
    prepare_emoji_dataset()
