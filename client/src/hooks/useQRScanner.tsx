import { useState, useRef, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';

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
      
      // Try environment camera first, fallback to any camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
      } catch (envError) {
        console.log('Environment camera not available, trying any camera');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        
        // Start QR code detection
        const scanQR = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (context && videoRef.current.videoWidth && videoRef.current.videoHeight) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                // Use jsQR to detect QR codes
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                  setQrResult(code.data);
                  stopScanning();
                  return;
                }
              }
            } catch (err) {
              console.error('QR scanning error:', err);
            }
            
            // Continue scanning if still active
            if (streamRef.current && streamRef.current.active) {
              animationRef.current = requestAnimationFrame(scanQR);
            }
          } else {
            // Wait for video to be ready
            animationRef.current = requestAnimationFrame(scanQR);
          }
        };
        
        // Start scanning after a short delay to ensure video is ready
        setTimeout(scanQR, 100);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or not available. Please check your camera permissions.');
      setIsScanning(false);
    }
  }, []);

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