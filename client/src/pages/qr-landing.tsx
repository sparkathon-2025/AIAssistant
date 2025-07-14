import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, ArrowRight } from 'lucide-react';

export default function QRLanding() {
  const [showScanner, setShowScanner] = useState(false);
  const [, navigate] = useLocation();

  const handleScanResult = (result: string) => {
    // Extract product ID from QR code result
    // Assuming QR code contains either just the ID or a URL with ID
    let storeId = result;
    
    // If it's a URL, try to extract ID from it
    if (result.includes('product') || result.includes('id=')) {
      const urlMatch = result.match(/id=([^&]+)/);
      if (urlMatch) {
        storeId = urlMatch[1];
      } else {
        // Try to extract from path
        const pathMatch = result.match(/\/product\/([^\/\?]+)/);
        if (pathMatch) {
          storeId = pathMatch[1];
        }
      }
    }
    
    // Navigate to chat with product ID
    navigate(`/chat?id=${encodeURIComponent(storeId)}`);
  };

  const handleManualEntry = () => {
    // Allow user to proceed without scanning
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Assistant
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Scan the store QR code to get instant information and assistance
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowScanner(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Scan QR Code
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Or
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleManualEntry}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Continue Without Scanning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Point your camera at a store QR code to get started
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}