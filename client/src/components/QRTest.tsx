import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/QRScanner';

export const QRTest = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleScanResult = (scanResult: string) => {
    setResult(scanResult);
    setShowScanner(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">QR Scanner Test</h2>
      
      <Button onClick={() => setShowScanner(true)} className="mb-4">
        Open QR Scanner
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-2">Scan Result:</p>
          <p className="text-sm font-mono bg-white p-2 rounded border break-all">
            {result}
          </p>
        </div>
      )}
      
      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};