import { useState, useRef, useCallback, useEffect } from 'react';

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrResult, setQrResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const startScanning = useCallback(async () => {
    try {
      setError('');
      setQrResult('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        
        // Start QR code detection
        const scanQR = async () => {
          if (videoRef.current && isScanning) {
            try {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (context) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                // Import jsQR dynamically
                const jsQR = await import('jsqr');
                const code = jsQR.default(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                  setQrResult(code.data);
                  stopScanning();
                  return;
                }
              }
            } catch (err) {
              console.error('QR scanning error:', err);
            }
            
            animationRef.current = requestAnimationFrame(scanQR);
          }
        };
        
        scanQR();
      }
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  }, [isScanning]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    qrResult,
    error,
    videoRef,
    startScanning,
    stopScanning,
    resetResult: () => setQrResult(''),
  };
};