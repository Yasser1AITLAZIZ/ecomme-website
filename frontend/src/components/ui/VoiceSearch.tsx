'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface VoiceSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function VoiceSearch({ onSearch, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript && onSearch) {
        onSearch(transcript);
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'p-3 rounded-full transition-all',
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-gold-600 text-black hover:bg-gold-500'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </motion.button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 bg-obsidian-900 border border-gold-600/30 rounded-lg p-4 min-w-[200px] z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gold-600 font-semibold">Listening...</span>
              <button onClick={stopListening} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {transcript && (
              <p className="text-sm text-white">{transcript}</p>
            )}
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-gold-600 rounded-full"
                  animate={{ height: [8, 16, 8] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

