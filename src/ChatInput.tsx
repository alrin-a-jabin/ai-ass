import React, { useState, useRef } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAudioSend?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const transcriptRef = useRef<string>('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.results.length - 1; i >= 0; i--) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript;
          } else {
            interimTranscript = transcript;
          }
        }

        transcriptRef.current = finalTranscript || interimTranscript;
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start(); // Restart if still recording
        }
      };

      recognition.start();
      recognitionRef.current = recognition;

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        // Send the transcribed text
        if (transcriptRef.current.trim()) {
          onSend(transcriptRef.current);
          transcriptRef.current = '';
        } else {
          alert('No speech detected. Please try again.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  console.log("stash 2")

  return (
    <div className="chat-input-container">
      <input
        type="text"
        className="chat-input"
        placeholder="Type your message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isRecording || disabled}
      />
      <button 
        className={`chat-record-btn ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        disabled={disabled}
      >
        {isRecording ? '⏹' : '🎤'}
      </button>
      <button className="chat-send-btn" onClick={handleSend} disabled={isRecording || disabled}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
