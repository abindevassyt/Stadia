import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InfoIconHelperProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoIconHelper({ content, title, position = 'bottom' }: InfoIconHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center ml-1.5 z-40">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-emerald-400 p-0.5 rounded-full hover:bg-slate-800/50 transition-all cursor-pointer focus:outline-none"
        aria-label="View explanation"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${positionClasses[position]} w-64 p-3 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md`}
          >
            {title && (
              <div className="font-bold text-white mb-1 border-b border-slate-800 pb-1 font-sans flex items-center justify-between">
                <span>{title}</span>
              </div>
            )}
            <p className="font-normal text-slate-300 font-sans leading-relaxed">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
