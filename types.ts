export interface Message {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  sourceUrl?: string;
  groundingChunks?: any[];
}

export interface ImageData {
  name: string;
  keywords: string[];
  imageUrl: string;
  sourceUrl: string;
}