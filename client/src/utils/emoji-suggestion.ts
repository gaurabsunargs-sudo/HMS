// @ts-nocheck
import Cookies from 'js-cookie'
import { serverUrl } from '@/api/server-url'
import { decryptData } from '@/lib/encryptionUtils'

interface EmojiSuggestion {
  emoji: string
  description: string
}

interface EmojiSuggestionResult {
  needsEmoji: boolean
  confidence: number
  classification: 'emotional' | 'neutral'
  originalText: string
  processedText: string
  suggestions: EmojiSuggestion[]
  error?: string
}

interface EmojiAnalysisResult extends EmojiSuggestionResult {
  timestamp: string
  recommendations: string[]
}

class EmojiSuggestionService {
  private baseUrl: string
  private isEnabled: boolean = true

  constructor(baseUrl: string = serverUrl || 'http://localhost:5000') {
    this.baseUrl = baseUrl
  }
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }
  isSuggestionEnabled(): boolean {
    return this.isEnabled
  }
  preprocessText(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?]/g, '')
      .replace(/\b(ur|u|youre|your)\b/g, 'you')
      .replace(/\b(plz|pls|please)\b/g, 'please')
      .replace(/\b(thx|thanks)\b/g, 'thank you')
      .replace(/\b(btw|by the way)\b/g, 'by the way')
      .replace(/\b(omg|oh my god)\b/g, 'oh my god')
      .replace(/\b(lol|laughing out loud)\b/g, 'laughing')
      .replace(/\b(rofl|rolling on floor laughing)\b/g, 'laughing')
      .replace(/\b(af|as fuck)\b/g, 'very')
      .replace(/\b(ily|i love you)\b/g, 'i love you')
      .replace(/\b(gtg|got to go)\b/g, 'got to go')
      .replace(/\b(gn|good night)\b/g, 'good night')
      .replace(/\b(gm|good morning)\b/g, 'good morning')
      .replace(/\b(ge|good evening)\b/g, 'good evening')
      .replace(/\b(ga|good afternoon)\b/g, 'good afternoon')
      .replace(/\b(ty|thank you)\b/g, 'thank you')
      .replace(/\b(yw|you're welcome)\b/g, 'you are welcome')
      .replace(/\b(np|no problem)\b/g, 'no problem')
      .replace(/\b(ok|okay)\b/g, 'okay')
      .replace(/\b(yeah|yes)\b/g, 'yes')
      .replace(/\b(nah|no)\b/g, 'no')
      .replace(/\b(maybe|perhaps)\b/g, 'maybe')
      .replace(/\b(probably|likely)\b/g, 'probably')
      .replace(/\b(definitely|certainly)\b/g, 'definitely')
      .replace(/\b(obviously|clearly)\b/g, 'obviously')
      .replace(/\b(actually|really)\b/g, 'actually')
      .replace(/\b(basically|essentially)\b/g, 'basically')
      .replace(/\b(literally|exactly)\b/g, 'literally')
      .replace(/\b(seriously|honestly)\b/g, 'seriously')
      .trim()
  }
  async getEmojiSuggestions(text: string): Promise<EmojiSuggestionResult> {
    if (!this.isEnabled) {
      return {
        needsEmoji: false,
        confidence: 0,
        classification: 'neutral',
        originalText: text,
        processedText: text,
        suggestions: [],
      }
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        needsEmoji: false,
        confidence: 0,
        classification: 'neutral',
        originalText: text,
        processedText: text,
        suggestions: [],
      }
    }

    try {
      const token = this.getAuthToken()

      const response = await fetch(`${this.baseUrl}/chat/emoji-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('❌ Error getting emoji suggestions:', error)
      return {
        needsEmoji: false,
        confidence: 0,
        classification: 'neutral',
        originalText: text,
        processedText: text,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private getAuthToken(): string | null {
    try {
      const encryptedToken = Cookies.get('hms-token')

      if (encryptedToken) {
        const token = decryptData(encryptedToken) as string
        return token
      }

      return null
    } catch (error) {
      console.warn('Could not get auth token:', error)
      return null
    }
  }

  async analyzeText(text: string): Promise<EmojiAnalysisResult> {
    const analysis = await this.getEmojiSuggestions(text)

    return {
      ...analysis,
      timestamp: new Date().toISOString(),
      recommendations: this.getRecommendations(analysis),
    }
  }

  getRecommendations(analysis: EmojiSuggestionResult): string[] {
    const recommendations: string[] = []

    if (analysis.needsEmoji) {
      if (analysis.confidence > 0.8) {
        recommendations.push(
          'Consider adding an emoji to express your emotions better.'
        )
      } else if (analysis.confidence > 0.6) {
        recommendations.push(
          'An emoji might help convey your feelings more clearly.'
        )
      } else {
        recommendations.push(
          'You might want to add an emoji to express your emotions.'
        )
      }

      recommendations.push(
        'Emojis can help doctors understand your emotional state better.'
      )
      recommendations.push(
        'Expressing emotions is important for proper medical care.'
      )
    } else {
      recommendations.push('Your message is clear and professional.')
    }

    return recommendations
  }

  getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      network: 'Unable to analyze emotions. Please try again.',
      server:
        'Server error occurred while analyzing emotions. Please try again.',
      timeout: 'Emotion analysis timed out. Please try again.',
      unknown:
        'An error occurred while analyzing your emotions. Please try again.',
    }

    return errorMessages[error] || errorMessages['unknown']
  }

  async validateMessage(text: string): Promise<{
    needsEmoji: boolean
    suggestions: EmojiSuggestion[]
  }> {
    const analysis = await this.getEmojiSuggestions(text)

    if (analysis.error || !analysis.needsEmoji) {
      return {
        needsEmoji: false,
        suggestions: [],
      }
    }

    return {
      needsEmoji: true,
      suggestions: analysis.suggestions,
    }
  }

  async getStats(): Promise<any> {
    try {
      const token = this.getAuthToken()

      const response = await fetch(`${this.baseUrl}/chat/emoji-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error getting emoji stats:', error)
      return null
    }
  }
}

const emojiSuggestionService = new EmojiSuggestionService()

export {
  EmojiSuggestionService,
  EmojiSuggestionResult,
  EmojiAnalysisResult,
  EmojiSuggestion,
}
export default emojiSuggestionService

export const getEmojiSuggestions = (text: string) =>
  emojiSuggestionService.getEmojiSuggestions(text)
export const analyzeText = (text: string) =>
  emojiSuggestionService.analyzeText(text)
export const validateMessage = (text: string) =>
  emojiSuggestionService.validateMessage(text)
export const preprocessText = (text: string) =>
  emojiSuggestionService.preprocessText(text)
export const setSuggestionEnabled = (enabled: boolean) =>
  emojiSuggestionService.setEnabled(enabled)
export const isSuggestionEnabled = () =>
  emojiSuggestionService.isSuggestionEnabled()
