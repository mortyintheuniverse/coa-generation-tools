'use client';

import { useEffect, useState } from 'react';

interface FontLoaderProps {
  children: React.ReactNode;
}

export function FontLoader({ children }: FontLoaderProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontsFailed, setFontsFailed] = useState(false);

  useEffect(() => {
    // Check if fonts are available
    const checkFonts = async () => {
      try {
        // Wait for fonts to load with a timeout
        await document.fonts.ready;
        
        // Check if Geist fonts are available
        const geistSansAvailable = document.fonts.check('1em Geist Sans');
        const geistMonoAvailable = document.fonts.check('1em Geist Mono');
        
        if (geistSansAvailable && geistMonoAvailable) {
          setFontsLoaded(true);
        } else {
          // Fonts failed to load, use fallbacks
          setFontsFailed(true);
          setFontsLoaded(true);
        }
      } catch (error) {
        console.warn('Font loading failed, using fallbacks:', error);
        setFontsFailed(true);
        setFontsLoaded(true);
      }
    };

    // Set a timeout for font loading
    const timeout = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('Font loading timeout, using fallbacks');
        setFontsFailed(true);
        setFontsLoaded(true);
      }
    }, 3000); // 3 second timeout

    checkFonts();

    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading fonts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={fontsFailed ? 'font-fallback' : ''}>
      {children}
    </div>
  );
}
