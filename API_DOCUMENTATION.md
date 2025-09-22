# LingoBoost AI API Documentation

## Overview
LingoBoost AI is a FastAPI-based language learning platform that provides AI-powered translation exercises, grammar explanations, vocabulary generation, and performance evaluation for language learners.

**Base URL**: `https://your-domain.com` (or `http://localhost:8000` for local development)

---

## Authentication
Currently, no authentication is required for these endpoints.

---

## Endpoints

### 1. Health Check

#### `GET /`
**Description**: Simple health check endpoint to verify the API is running.

**Response**:
```json
{
  "message": "Hello World"
}
```

---

### 2. Evaluate User Performance

#### `POST /evaluate`
**Description**: Evaluates user's translation performance and provides personalized recommendations.

**Request Body**:
```json
{
  "current_sentence_length": 5,
  "translation_history": "JSON string of past translations",
  "from_language": "English",
  "to_language": "Vietnamese"
}
```

**Parameters**:
- `current_sentence_length` (int, required): Current complexity level (3-20)
- `translation_history` (string, required): JSON string of user's translation history
- `from_language` (string, required): Source language
- `to_language` (string, required): Target language

**Response**:
```json
{
  "success": true,
  "evaluation": "Detailed performance analysis and recommendations",
  "translation_history_length": 1234
}
```

---

### 3. Explain Sentence

#### `POST /explain`
**Description**: Provides detailed explanation of vocabulary and grammar for a given sentence.

**Request Body**:
```json
{
  "sentence": "Tôi đang học tiếng Việt.",
  "to_language": "Vietnamese",
  "from_language": "English"
}
```

**Parameters**:
- `sentence` (string, required): The sentence to explain
- `to_language` (string, required): Language of the sentence
- `from_language` (string, optional): Language for explanations (default: "English")

**Response**:
```json
{
  "success": true,
  "explanation": "Detailed word-by-word and grammar explanation",
  "sentence": "Tôi đang học tiếng Việt."
}
```

---

### 4. Generate Vocabulary Words

#### `POST /generate_words`
**Description**: Generates vocabulary words based on a specific subject or theme.

**Request Body**:
```json
{
  "subject": "food",
  "from_language": "Vietnamese",
  "count": 20
}
```

**Parameters**:
- `subject` (string, optional): Topic for vocabulary generation
- `from_language` (string, required): Target language for vocabulary
- `count` (int, optional): Number of words to generate (1-50, default: 20)

**Response**:
```json
{
  "success": true,
  "words": [
    {
      "word": "cơm",
      "translation": "rice",
      "part_of_speech": "noun",
      "example_sentence": "Tôi ăn cơm mỗi ngày.",
      "example_translation": "I eat rice every day."
    }
  ],
  "subject": "food",
  "language": "Vietnamese",
  "count": 20,
  "total_generated": 20
}
```

---

### 5. Generate Simple Exercises

#### `POST /generate_exercises_simple`
**Description**: Generates simple translation exercises without complex evaluation parameters.

**Request Body**:
```json
{
  "from_language": "English",
  "to_language": "Vietnamese",
  "subject": "daily life",
  "sentence_length": 5,
  "count": 10
}
```

**Parameters**:
- `from_language` (string, required): Source language
- `to_language` (string, required): Target language
- `subject` (string, optional): Theme for sentences
- `sentence_length` (int, optional): Target sentence length (3-20, default: 5)
- `count` (int, optional): Number of exercises (default: 10)

**Response**:
```json
{
  "success": true,
  "exercises": [
    {
      "from": "The weather is beautiful today.",
      "to": "Thời tiết hôm nay đẹp.",
      "words": ["Thời tiết", "hôm nay", "đẹp"]
    }
  ]
}
```

---

### 6. Explain Grammar

#### `POST /explain_grammar`
**Description**: Provides comprehensive explanations of grammar topics for any language.

**Request Body**:
```json
{
  "grammar_topic": "past tense",
  "to_language": "Vietnamese",
  "from_language": "English"
}
```

**Parameters**:
- `grammar_topic` (string, required): The grammar concept to explain
- `to_language` (string, required): Language the grammar topic is for
- `from_language` (string, required): Language for the explanation

**Response**:
```json
{
  "success": true,
  "explanation": "Comprehensive grammar explanation with examples, rules, and tips",
  "grammar_topic": "past tense",
  "from_language": "English",
  "to_language": "Vietnamese"
}
```

---

### 7. Advanced Exercise Generation

#### `POST /generate_exercises`
**Description**: Generates customized translation exercises based on detailed evaluation and learning parameters.

**Request Body**:
```json
{
  "evaluation": "Performance analysis text",
  "sentence_length": 6,
  "from_language": "English",
  "to_language": "Vietnamese",
  "old_words": ["hello", "goodbye"],
  "new_words": ["family", "home"],
  "grammar_topics": ["present tense", "question formation"],
  "past_mistakes": ["incorrect verb conjugation"],
  "subject": "family",
  "length": 15
}
```

**Parameters**:
- `evaluation` (string, required): Performance evaluation text
- `sentence_length` (int, required): Target sentence length (3-20)
- `from_language` (string, required): Source language
- `to_language` (string, required): Target language
- `old_words` (array, optional): Previously learned words
- `new_words` (array, optional): New words to practice
- `grammar_topics` (array, optional): Grammar topics to focus on
- `past_mistakes` (array, optional): Previous mistakes to address
- `subject` (string, optional): Theme for exercises
- `length` (int, optional): Number of exercises to generate

**Response**:
```json
{
  "success": true,
  "exercises": [
    {
      "from": "My family lives in a big house.",
      "to": "Gia đình tôi sống trong một ngôi nhà lớn.",
      "words": ["Gia đình", "tôi", "sống", "trong", "một", "ngôi nhà", "lớn"]
    }
  ],
  "subject": "family",
  "evaluation_length": 500
}
```

---

### 8. Complete Workflow

#### `POST /evaluate_and_generate`
**Description**: Complete workflow that evaluates performance and generates customized exercises in one call.

**Request Body**:
```json
{
  "translation_history": "JSON string of translation history",
  "subject": "travel",
  "length": 20
}
```

**Parameters**:
- `translation_history` (string, required): JSON string of user's translation history
- `subject` (string, optional): Theme for generated exercises
- `length` (int, optional): Number of exercises to generate

**Response**:
```json
{
  "success": true,
  "evaluation": "Performance analysis",
  "exercises": [
    {
      "from": "I want to book a hotel room.",
      "to": "Tôi muốn đặt phòng khách sạn.",
      "words": ["Tôi", "muốn", "đặt", "phòng", "khách sạn"]
    }
  ],
  "subject": "travel",
  "translation_history_length": 1000,
  "workflow": "evaluate_and_generate",
  "exercises_length": 20
}
```

---

### 9. Generate Mock Translations (Testing)

#### `POST /generate_mock_translations`
**Description**: Generates mock user translations for testing purposes.

**Request Body**:
```json
{
  "new_exercises": "[{\"eng\": \"Hello world\", \"viet\": \"Xin chào thế giới\"}]"
}
```

**Parameters**:
- `new_exercises` (string, required): JSON string of exercises with "eng" and "viet" fields

**Response**:
```json
{
  "success": true,
  "mock_translations": [
    {
      "eng": "Hello world",
      "viet": "Xin chào thế giới",
      "user_translation": "Xin chào thế giới"
    }
  ],
  "input_exercises_count": 1,
  "description": "Mock user translations generated for testing"
}
```

---

### 10. Legacy Endpoint

#### `POST /evaluate_performance`
**Description**: Legacy endpoint for evaluating user performance (deprecated, use `/evaluate` instead).

---


#### `POST /generate_themes`
**Description**: Generates fun and specific themes/topics for translation exercises that focus on unique vocabulary or grammatical structures.

**Request Body**:
```json
{
  "count": 20,
  "language": "Vietnamese"
}
```

**Parameters**:
- `count` (int, optional): Number of themes to generate (1-20, default: 50)
- `language` (string, optional): Target language for exercises (default: "English")

**Response**:
```json
{
  "success": true,
  "themes": [
    "cute animals and their baby names",
    "adjectives to describe personality traits",
    "conditional sentences about imaginary situations", 
    "phrases using 'it is too ___ to ___'",
    "questions using the five W words (who, what, when, where, why)",
    "present continuous tense for describing current activities",
    "comparisons between city and countryside life",
    "past tense stories about childhood memories",
    "polite requests and formal language",
    "weather expressions and seasonal activities",
    "food textures and flavors vocabulary",
    "emotions and feelings in different contexts",
    "travel vocabulary for airport situations",
    "family relationships and kinship terms",
    "workplace communication phrases",
    "shopping and bargaining expressions",
    "health and medical terminology",
    "technology and social media vocabulary",
    "environmental and nature topics",
    "cultural celebrations and traditions"
  ],
  "language": "Vietnamese",
  "count": 20,
  "total_generated": 20
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error description"
}
```

### Common Error Codes:
- **400 Bad Request**: Invalid input parameters
- **500 Internal Server Error**: Server-side processing error

---

## Usage Examples

### Basic Workflow:
1. **Generate simple exercises**: `POST /generate_exercises_simple`
2. **Get explanations**: `POST /explain` for sentences, `POST /explain_grammar` for grammar
3. **Build vocabulary**: `POST /generate_words`
4. **Evaluate progress**: `POST /evaluate` (with translation history)
5. **Get advanced exercises**: `POST /generate_exercises` (based on evaluation)

### For Testing:
1. **Generate exercises**: `POST /generate_exercises_simple`
2. **Create mock translations**: `POST /generate_mock_translations`
3. **Evaluate mock performance**: `POST /evaluate`

---

## Rate Limits
Currently no rate limits are enforced, but this may change in production.

---

## Support
For questions or issues, please contact the development team.

---

**Last Updated**: December 2024
**API Version**: 1.0