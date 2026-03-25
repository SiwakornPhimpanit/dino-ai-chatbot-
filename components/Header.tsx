
import React from 'react';

const DinoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-green-600"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14.5,14H14v-1.5c0-0.83-0.67-1.5-1.5-1.5h-1C10.67,11,10,11.67,10,12.5V14H8.5C6.57,14,5,15.57,5,17.5V19h14v-1.5 C19,15.57,17.43,14,14.5,14z M15,8c0,1.66-1.34,3-3,3S9,9.66,9,8s1.34-3,3-3S15,6.34,15,8z M12.67,4.05C12.44,4.02,12.22,4,12,4 c-3.97,0-7.22,2.83-7.85,6.5H4v2h0.09c0.04,0.33,0.09,0.66,0.16,0.97C4.16,14.33,4.08,15.7,4,16.03V20h2v-4.5c0-0.28,0.22-0.5,0.5-0.5 h1.5v-1.5c0-0.28,0.22-0.5,0.5-0.5h1c0.28,0,0.5,0.22,0.5,0.5V14h1.5c0.28,0,0.5,0.22,0.5,0.5V20h2v-4.03 c-0.08-0.33-0.16-1.7-0.25-3.07c0.07-0.31,0.12-0.64,0.16-0.97H20v-2h-0.15C19.22,6.83,15.97,4,12,4C12.67,4,12.67,4.05,12.67,4.05z" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md w-full z-10">
      <div className="max-w-4xl mx-auto py-3 px-4 flex items-center space-x-3">
        <DinoIcon />
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dino AI Chat Bot</h1>
          <p className="text-sm text-gray-500">ผู้ช่วย AI ท่องเที่ยวเมืองไดโนเสาร์</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
