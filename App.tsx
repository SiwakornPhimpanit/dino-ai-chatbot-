
import React, { useState, useEffect } from 'react';
import type { Message, ImageData } from './types.ts';
import { sendMessageWithHistory } from './services/geminiService.ts';
import { getImageData } from './services/dataService.ts';
import Header from './components/Header.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import MessageInput from './components/MessageInput.tsx';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageData, setImageData] = useState<ImageData[]>([]);

  const findPlaceInDB = (query: string): ImageData | undefined => {
    const lowerCaseQuery = query.toLowerCase();
    return imageData.find(place =>
      place.keywords.some(keyword => lowerCaseQuery.includes(keyword.toLowerCase()))
    );
  };

  useEffect(() => {
    try {
      const localData = getImageData();
      setImageData(localData);
      
      setMessages([
        {
          role: 'model',
          text: 'สวัสดีครับ ผมคือไกด์! ผู้เชี่ยวชาญเรื่องเที่ยวในกาฬสินธุ์ ตอนนี้ผมเชื่อมต่อกับฐานข้อมูลพิเศษแล้ว ลองถามเกี่ยวกับ "วัดกลาง" หรือ "พิพิธภัณฑ์ไดโนเสาร์" ได้เลยครับ',
        },
      ]);
    } catch (error)
 {
      console.error("Failed to initialize the application:", error);
      setMessages([
        {
          role: 'model',
          text: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการเริ่มต้นระบบ กรุณาลองใหม่อีกครั้งในภายหลัง',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: inputText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const matchedPlace = findPlaceInDB(inputText);

      const response = await sendMessageWithHistory(messages, inputText);
      const modelResponseText = response.text.trim();

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      let finalMessage: Message;
      
      const tagRegex = /\[IMAGE:\s*"?([^"\]]+)"?\]|\[SOURCE:\s*"?([^"\]]+)"?\]/g;
      let extractedImageUrl: string | undefined;
      let extractedSourceUrl: string | undefined;
      
      let cleanedText = modelResponseText.replace(tagRegex, (match, img, src) => {
        if (img) extractedImageUrl = img.trim();
        if (src) extractedSourceUrl = src.trim();
        return '';
      }).trim();

      cleanedText = cleanedText.replace(/^(ที่มา|source)\s*:\s*.*$/im, '').trim();

      if (matchedPlace) {
        finalMessage = {
          role: 'model',
          text: cleanedText,
          imageUrl: matchedPlace.imageUrl,
          sourceUrl: matchedPlace.sourceUrl,
          groundingChunks: groundingChunks,
        };
      } else {
        finalMessage = {
          role: 'model',
          text: cleanedText,
          imageUrl: extractedImageUrl,
          sourceUrl: extractedSourceUrl,
          groundingChunks: groundingChunks,
        };
      }
      
      if (finalMessage.text || finalMessage.imageUrl) {
        setMessages((prevMessages) => [...prevMessages, finalMessage]);
      } else if (modelResponseText) {
         setMessages((prevMessages) => [...prevMessages, { role: 'model', text: modelResponseText}]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: 'model',
        text: 'ขออภัยค่ะ มีปัญหาในการรับข้อมูล กรุณาลองอีกครั้ง',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;