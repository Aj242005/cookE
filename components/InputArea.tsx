import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { validateFile } from '../utils/validation';

interface InputAreaProps {
  onSendMessage: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
  zenMode: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, zenMode }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use custom hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();

  // Sync transcript to input text
  useEffect(() => {
    if (transcript) {
      setText(prev => {
         const cleanTranscript = transcript.trim();
         // Avoid duplicating if already present at end
         if (prev.endsWith(cleanTranscript)) return prev;
         return prev + (prev ? ' ' : '') + cleanTranscript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { valid, error } = validateFile(file);
      if (!valid) {
        alert(error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && !selectedImage) || isLoading) return;
    
    // Sanitize input
    const cleanText = text.trim();
    
    onSendMessage(cleanText, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Image Preview */}
      {selectedImage && (
        <div className="relative w-fit animate-fade-in">
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="h-20 w-20 object-cover rounded-lg border border-gray-300 shadow-sm"
          />
          <button 
            onClick={() => {
              setSelectedImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Voice Button */}
        <button
          onClick={toggleListening}
          className={`
             p-3 rounded-full transition-all duration-300 relative
             ${isListening 
               ? 'bg-red-500 text-white animate-pulse shadow-lg' 
               : zenMode 
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-md' 
                  : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
             }
          `}
          title={isListening ? "Stop Listening" : "Start Voice Command"}
          aria-label={isListening ? "Stop Voice Input" : "Start Voice Input"}
          disabled={isLoading}
        >
          <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
          {isListening && <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>}
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
          title="Upload photo"
          aria-label="Upload photo"
          disabled={isLoading}
        >
          <i className="fas fa-camera text-xl"></i>
        </button>
        
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />

        <div className={`
            flex-1 border rounded-2xl focus-within:ring-2 focus-within:border-transparent transition-all overflow-hidden flex items-end
            ${zenMode 
                ? 'bg-emerald-50/50 border-emerald-100 focus-within:ring-emerald-500' 
                : 'bg-gray-50 border-gray-300 focus-within:ring-orange-500'
            }
        `}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={adjustHeight}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : (zenMode ? "Speak or type gently..." : "Ask CookingPro...")}
            className="w-full bg-transparent border-none focus:ring-0 p-3 max-h-32 resize-none text-gray-800 placeholder-gray-400"
            rows={1}
            disabled={isLoading}
            aria-label="Chat input"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={(!text.trim() && !selectedImage) || isLoading}
          aria-label="Send message"
          className={`
            p-3 rounded-full shadow-md transition-all flex items-center justify-center w-12 h-12
            ${(!text.trim() && !selectedImage) || isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : zenMode
                 ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                 : 'bg-orange-600 text-white hover:bg-orange-700'
            }
          `}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;