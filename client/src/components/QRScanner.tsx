import { useQRScanner } from '@/hooks/useQRScanner';
import { Button } from '@/components/ui/button';
import { X, Camera, QrCode } from 'lucide-react';
import { useEffect } from 'react';

interface QRScannerProps {
  onScanResult: (result: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanResult, onClose }: QRScannerProps) => {
  const { 
    isScanning, 
    qrResult, 
    error, 
    videoRef, 
    startScanning, 
    stopScanning, 
    resetResult 
  } = useQRScanner();

  const handleScanResult = (result: string) => {
    onScanResult(result);
    onClose();
  };

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  useEffect(() => {
    if (qrResult) {
      handleScanResult(qrResult);
    }
  }, [qrResult]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code Scanner</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-300 mt-1">
              Make sure to allow camera access when prompted by your browser.
            </p>
          </div>
        )}

        {!qrResult && (
          <>
            <div className="mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              ) : (
                <Button variant="outline" onClick={stopScanning} className="flex-1">
                  <QrCode className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Position the QR code within the camera view. Make sure it's well-lit and clear.
            </p>
          </>
        )}
      </div>
    </div>
  );
};