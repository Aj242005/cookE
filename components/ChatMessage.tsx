import React, { memo } from 'react';
import { Message, UserRole } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === UserRole.USER;

  // Simple formatter to handle bolding and basic newlines effectively
  // Memoization isn't needed for this internal function as it's lightweight,
  // but the component itself is memoized below.
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Check for headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold text-orange-600 mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-orange-700 mt-3 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-gray-800 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      
      // Check for checkboxes (Task lists)
      if (line.trim().startsWith('- [ ]')) {
        return (
          <div key={i} className="flex items-start my-1">
             <input type="checkbox" className="mt-1.5 mr-2 accent-orange-500" readOnly aria-hidden="true" />
             <span className="text-gray-700">{parseInline(line.replace('- [ ]', ''))}</span>
          </div>
        );
      }
      
      // Check for bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
         return (
             <div key={i} className="flex items-start my-1 ml-4">
                 <span className="mr-2 text-orange-500" aria-hidden="true">•</span>
                 <span>{parseInline(line.replace(/^[-*]\s/, ''))}</span>
             </div>
         );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="h-2"></div>;
      }

      return <p key={i} className="mb-1">{parseInline(line)}</p>;
    });
  };

  // Helper to parse **bold** inside lines
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`} role="listitem">
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
          <i className={`fas ${isUser ? 'fa-user' : 'fa-hat-chef text-lg'}`} aria-hidden="true"></i>
        </div>

        {/* Bubble */}
        <div 
          className={`
            p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none markdown-content'
            }
          `}
        >
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="Uploaded cooking content" 
                className="max-h-60 rounded-lg border border-white/20 object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          <div className={isUser ? "whitespace-pre-wrap" : ""}>
             {isUser ? message.text : renderContent(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Use memo to prevent re-renders of older messages when new ones arrive
export default memo(ChatMessage);