# AI Language Chat Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Run the Application
```bash
npm run dev
```

## 🎯 Features

### Voice Input with AI Analysis
- **Click the microphone 🎤** to start voice recording
- **Speak your message** - it's converted to text in real-time
- **Click stop ⏹** - AI analyzes your speech for:
  - Grammar issues
  - Pronunciation problems (from transcription)
  - Language usage errors
  - Clarity issues

### AI-Powered Responses
- AI provides corrections and suggestions when needed
- Natural conversation when your speech is clear
- Real-time feedback on language usage

### Visual Indicators
- **Blue bubbles** = Your messages (right-aligned)
- **Gray bubbles** = AI responses (left-aligned)
- **Orange border** = AI detected issues in your speech
- **Typing animation** = AI is thinking

## 🌐 Browser Support

**Voice Recognition works best in:**
- Google Chrome
- Microsoft Edge

**Note:** Safari and Firefox have limited speech recognition support.

## 🔧 Troubleshooting

### "Speech recognition is not supported"
- Use Chrome or Edge browser
- Ensure you're on a secure connection (HTTPS or localhost)

### "Could not access microphone"
- Allow microphone permissions when prompted
- Check browser settings for microphone access

### "AI service not configured"
- Verify your OpenAI API key is set in `.env`
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart the dev server after adding the key

### API Rate Limits
- Free tier: Limited requests per minute
- Consider upgrading your OpenAI plan for production use

## 💡 How It Works

1. **Voice Recording**: Uses Web MediaRecorder API to capture audio
2. **Speech-to-Text**: Browser's built-in Speech Recognition API converts speech to text
3. **AI Analysis**: OpenAI's GPT-3.5 analyzes the text for language issues
4. **Smart Response**: AI provides corrections or responds naturally

## 🔐 Security Notes

⚠️ **Important**: The current setup uses `dangerouslyAllowBrowser: true` which is only for development/demo purposes.

**For production**, you should:
1. Create a backend API endpoint
2. Store API keys on the server
3. Make OpenAI calls from your backend
4. Never expose API keys in frontend code

## 📝 Example Usage

**Type or speak:**
- "I is going to the store"
  - AI: "I noticed a grammar issue: it should be 'I am going to the store' not 'I is'..."

- "Hello, how are you today?"
  - AI: "Hello! I'm doing well, thank you for asking. That was perfectly said! How are you?"

## 🎓 Perfect for Language Learning

Use this app to:
- Practice pronunciation
- Get instant grammar feedback
- Improve conversational skills
- Build confidence in speaking
