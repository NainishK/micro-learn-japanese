const JAPANESE_LESSONS = {
  hiraganaVowels: {
    title: "Hiragana - Vowels",
    exercises: [
      {
        type: "character",
        question: "What sound does this character make? あ",
        answer: "a",
        hint: "This is the first vowel in Hiragana, makes an 'ah' sound like in 'father'",
        romanji: "a"
      },
      {
        type: "character",
        question: "What sound does this character make? い",
        answer: "i",
        hint: "Makes an 'ee' sound like in 'feet'",
        romanji: "i"
      },
      {
        type: "character",
        question: "What sound does this character make? う",
        answer: "u",
        hint: "Makes an 'oo' sound like in 'boot'",
        romanji: "u"
      },
      {
        type: "character",
        question: "What sound does this character make? え",
        answer: "e",
        hint: "Makes an 'eh' sound like in 'pet'",
        romanji: "e"
      },
      {
        type: "character",
        question: "What sound does this character make? お",
        answer: "o",
        hint: "Makes an 'oh' sound like in 'go'",
        romanji: "o"
      },
      {
        type: "reverse",
        question: "Write the Hiragana character for the 'a' sound",
        answer: "あ",
        hint: "This is the first character in the Hiragana alphabet",
        romanji: "a"
      },
      {
        type: "reverse",
        question: "Write the Hiragana character for the 'i' sound",
        answer: "い",
        hint: "Looks like two short parallel lines",
        romanji: "i"
      }
    ]
  },
  hiraganaK: {
    title: "Hiragana - K Group",
    exercises: [
      {
        type: "character",
        question: "What sound does this character make? か",
        answer: "ka",
        hint: "Combines 'k' with the 'a' vowel sound",
        romanji: "ka"
      },
      {
        type: "character",
        question: "What sound does this character make? き",
        answer: "ki",
        hint: "Combines 'k' with the 'i' vowel sound",
        romanji: "ki"
      },
      {
        type: "character",
        question: "What sound does this character make? く",
        answer: "ku",
        hint: "Combines 'k' with the 'u' vowel sound",
        romanji: "ku"
      },
      {
        type: "character",
        question: "What sound does this character make? け",
        answer: "ke",
        hint: "Combines 'k' with the 'e' vowel sound",
        romanji: "ke"
      },
      {
        type: "character",
        question: "What sound does this character make? こ",
        answer: "ko",
        hint: "Combines 'k' with the 'o' vowel sound",
        romanji: "ko"
      }
    ]
  },
  hiraganaS: {
    title: "Hiragana - S Group",
    exercises: [
      {
        type: "character",
        question: "What sound does this character make? さ",
        answer: "sa",
        hint: "Combines 's' with the 'a' vowel sound",
        romanji: "sa"
      },
      {
        type: "character",
        question: "What sound does this character make? し",
        answer: "shi",
        hint: "This is a special one - pronounced 'shi' not 'si'",
        romanji: "shi"
      },
      {
        type: "character",
        question: "What sound does this character make? す",
        answer: "su",
        hint: "Combines 's' with the 'u' vowel sound",
        romanji: "su"
      },
      {
        type: "character",
        question: "What sound does this character make? せ",
        answer: "se",
        hint: "Combines 's' with the 'e' vowel sound",
        romanji: "se"
      },
      {
        type: "character",
        question: "What sound does this character make? そ",
        answer: "so",
        hint: "Combines 's' with the 'o' vowel sound",
        romanji: "so"
      }
    ]
  },
  hiraganaT: {
    title: "Hiragana - T Group",
    exercises: [
      {
        type: "character",
        question: "What sound does this character make? た",
        answer: "ta",
        hint: "Combines 't' with the 'a' vowel sound",
        romanji: "ta"
      },
      {
        type: "character",
        question: "What sound does this character make? ち",
        answer: "chi",
        hint: "This is a special one - pronounced 'chi' not 'ti'",
        romanji: "chi"
      },
      {
        type: "character",
        question: "What sound does this character make? つ",
        answer: "tsu",
        hint: "This is a special one - pronounced 'tsu' not 'tu'",
        romanji: "tsu"
      },
      {
        type: "character",
        question: "What sound does this character make? て",
        answer: "te",
        hint: "Combines 't' with the 'e' vowel sound",
        romanji: "te"
      },
      {
        type: "character",
        question: "What sound does this character make? と",
        answer: "to",
        hint: "Combines 't' with the 'o' vowel sound",
        romanji: "to"
      }
    ]
  },
  basicPhrases: {
    title: "Basic Phrases",
    exercises: [
      {
        type: "translation",
        question: "How do you say 'Hello' in Japanese?",
        answer: "こんにちは",
        romanji: "konnichiwa",
        hint: "This is the most common greeting in Japanese"
      },
      {
        type: "translation",
        question: "How do you say 'Thank you' in Japanese?",
        answer: "ありがとう",
        romanji: "arigatou",
        hint: "A very important phrase to show gratitude"
      }
    ]
  },
  numbers: {
    title: "Numbers 1-10",
    exercises: [
      {
        type: "number",
        question: "What is the Japanese number for 1?",
        answer: "いち",
        romanji: "ichi",
        hint: "Starts with 'i'"
      },
      {
        type: "number",
        question: "What is the Japanese number for 2?",
        answer: "に",
        romanji: "ni",
        hint: "Very short, just one character"
      }
    ]
  }
};

// Helper function to get a random exercise
function getRandomExercise() {
  const categories = Object.keys(JAPANESE_LESSONS);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const exercises = JAPANESE_LESSONS[randomCategory].exercises;
  const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
  
  return {
    ...randomExercise,
    category: JAPANESE_LESSONS[randomCategory].title
  };
}

export { JAPANESE_LESSONS, getRandomExercise };
