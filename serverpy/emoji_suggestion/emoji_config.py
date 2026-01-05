EMOJI_NAMES = {
    '😢': 'Crying Face',
    '❤️': 'Red Heart',
    '😊': 'Smiling Face',
    '😟': 'Worried Face',
    '😠': 'Angry Face',
    '🎉': 'Party Popper',
    '🤩': 'Star-Struck',
    '😌': 'Relieved Face',
    '😲': 'Astonished Face',
    '😐': 'Neutral Face',
    '😴': 'Sleeping Face',
    '😡': 'Enraged Face',
    '😭': 'Loudly Crying',
    '😔': 'Pensive Face',
    '😞': 'Disappointed Face',
    '💔': 'Broken Heart',
    '😥': 'Sad but Relieved',
    '😪': 'Sleepy Face',
    '🥺': 'Pleading Face',
    '😩': 'Weary Face',
    '😍': 'Heart Eyes',
    '💕': 'Two Hearts',
    '😘': 'Kissing Heart',
    '💖': 'Sparkling Heart',
    '😁': 'Beaming Face',
    '😄': 'Grinning Face',
    '🙂': 'Slightly Smiling',
    '😃': 'Grinning Face with Big Eyes',
    '😰': 'Anxious Face',
    '😨': 'Fearful Face',
    '😧': 'Anguished Face',
    '🤬': 'Face with Symbols',
    '😤': 'Face with Steam',
    '🎊': 'Confetti Ball',
    '🥳': 'Partying Face',
    '🎈': 'Balloon',
    '🤗': 'Hugging Face',
    '😆': 'Grinning Squinting',
    '😮‍💨': 'Face Exhaling',
    '😮': 'Face with Open Mouth',
    '😯': 'Hushed Face',
    '🤯': 'Exploding Head',
    '😑': 'Expressionless',
    '😶': 'Face Without Mouth',
    '🥱': 'Yawning Face',
}

EMOTION_EMOJI_GROUPS = {
    'sadness': ['😢', '😭', '😔', '😞', '😥'],
    'love': ['❤️', '😍', '💕', '😘', '💖'],
    'happiness': ['😊', '😁', '😄', '🙂', '😃'],
    'worry': ['😟', '😰', '😨', '😧'],
    'anger': ['😠', '😡', '🤬', '😤'],
    'fun': ['🎉', '🎊', '🥳', '🎈'],
    'enthusiasm': ['🤩', '😍', '🤗', '😆'],
    'relief': ['😌', '😮‍💨', '😊'],
    'surprise': ['😲', '😮', '😯', '🤯'],
    'neutral': ['😐', '😑', '😶'],
    'boredom': ['😴', '🥱', '😪'],
}


def get_emoji_name(emoji: str) -> str:
    """Get the name of an emoji"""
    return EMOJI_NAMES.get(emoji, 'Emoji')


def get_emotion_emojis(emotion: str) -> list:
    """Get list of emojis for a given emotion"""
    return EMOTION_EMOJI_GROUPS.get(emotion, [])


def detect_emotion(emoji: str) -> str:
    """Detect which emotion an emoji belongs to"""
    for emotion, emojis in EMOTION_EMOJI_GROUPS.items():
        if emoji in emojis:
            return emotion
    return 'neutral'


def preprocess_text(text: str) -> str:
    """Preprocess text: lowercase, remove mentions and hashtags"""
    if not text:
        return ""
    text = str(text).lower()
    text = text.replace('@user', '')
    text = text.replace('#', '')
    return text.strip()
