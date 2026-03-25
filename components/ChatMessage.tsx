
import React, { useState } from 'react';
import type { Message } from '../types.ts';
import { getImageData } from '../services/dataService.ts';

interface ChatMessageProps {
  message: Message;
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        You
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [imageError, setImageError] = useState(false);
  const localImageData = getImageData();

  const getHostname = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return null;
    }
  };

  const sourceHostname = getHostname(message.sourceUrl);
  const shouldShowSource = sourceHostname && message.sourceUrl && !isUser && sourceHostname !== 'raw.githubusercontent.com';

  const renderText = (text: string) => text.split('\n').map((line, index) => (
    <React.Fragment key={index}>{line}<br /></React.Fragment>
  ));

  const parts = message.text.split(/(?=^\d+\.\s*\*\*)/m).map(p => p.trim()).filter(Boolean);
  const isMultiLocation = parts.length > 1 || (parts.length === 1 && /^\d+\.\s*\*\*/.test(parts[0]));

  if (!isMultiLocation) {
    const firstMapChunk = message.groundingChunks?.find(c => c.maps?.uri);
    const locationUrl = firstMapChunk?.maps?.uri;

    return (
      <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <ModelIcon />}
        <div className={`max-w-lg rounded-2xl overflow-hidden ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
          {message.imageUrl && !isUser && !imageError && (
            <img src={message.imageUrl} alt="ภาพประกอบสถานที่ท่องเที่ยว" className="w-full h-auto bg-gray-200" onError={() => setImageError(true)} />
          )}
          {(message.text || locationUrl || shouldShowSource) && (
            <div className="px-4 py-3">
              {locationUrl && !isUser && (
                <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2 font-medium">
                  <MapPinIcon />
                  <span>เปิดแผนที่ Google Maps</span>
                </a>
              )}
              {message.text && <p className="text-sm">{renderText(message.text)}</p>}
              {shouldShowSource && (
                <div className={message.text || locationUrl ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
                  <a href={message.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    {`ที่มา: ${sourceHostname}`}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        {isUser && <UserIcon />}
      </div>
    );
  }

  const intro = !/^\d+\.\s*\*\*/.test(parts[0]) ? parts.shift() : null;
  const mapChunks = message.groundingChunks?.filter(c => c.maps?.uri) || [];

  return (
    <div className="flex items-start gap-3 justify-start">
      <ModelIcon />
      <div className="max-w-lg rounded-2xl bg-white text-gray-800 shadow-sm rounded-bl-none overflow-hidden">
        <div className="px-4 py-3">
          {intro && <p className="text-sm mb-4">{renderText(intro)}</p>}
          <div className="space-y-4">
            {parts.map((itemText, index) => {
              const nameMatch = itemText.match(/\*\*(.*?)\*\*/);
              const name = nameMatch ? nameMatch[1].replace(/\(.*\)/, '').trim() : null;
              let imageUrl;
              
              if (name) {
                const nameLower = name.toLowerCase();
                const matchedPlace = localImageData.find(place => place.keywords.some(kw => nameLower.includes(kw.toLowerCase())));
                imageUrl = matchedPlace?.imageUrl;
              }
              
              const locationUrl = mapChunks[index]?.maps?.uri;

              return (
                <div key={index} className={index > 0 ? 'border-t border-gray-200 pt-4' : ''}>
                  {imageUrl && <img src={imageUrl} alt={`ภาพของ ${name}`} className="w-full h-auto rounded-lg mb-2 bg-gray-200" />}
                  {locationUrl && (
                    <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2 font-medium">
                      <MapPinIcon />
                      <span>เปิดแผนที่ Google Maps</span>
                    </a>
                  )}
                  <p className="text-sm">{renderText(itemText)}</p>
                </div>
              );
            })}
          </div>
          {shouldShowSource && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <a href={message.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                {`ที่มา: ${sourceHostname}`}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;