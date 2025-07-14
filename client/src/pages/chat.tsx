import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useImageUpload } from "@/hooks/useImageUpload";
import { QRScanner } from "@/components/QRScanner";
import { ImageUpload } from "@/components/ImageUpload";
import { QRTest } from "@/components/QRTest";
import { Moon, Sun, Mic, MicOff, Volume2, VolumeX, QrCode, Image as ImageIcon, Paperclip } from "lucide-react";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; preview: string; base64: string }>>([]);
  const [location] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Extract product ID from URL query parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const productId = urlParams.get('productId');
  
  // Voice functionality
  const { 
    isListening, 
    transcript, 
    isSupported: speechRecognitionSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  
  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking, 
    isSupported: speechSynthesisSupported 
  } = useSpeechSynthesis();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInputMessage("");
      resetTranscript();
      setUploadedImages([]);
      setShowImageUpload(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      
      // Auto-speak AI response if enabled
      if (autoSpeak && data.aiMessage?.content) {
        speak(data.aiMessage.content);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Auto-resize textarea on message change
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Handle product ID from URL parameters
  useEffect(() => {
    if (productId && !sendMessageMutation.isPending) {
      const productInfoMessage = `Please provide information about product ID: ${productId}`;
      setInputMessage(productInfoMessage);
      
      toast({
        title: "Product Scanned",
        description: "Getting product information...",
      });
      
      // Auto-send the message after a short delay
      setTimeout(() => {
        sendMessageMutation.mutate(productInfoMessage);
      }, 1000);
    }
  }, [productId, sendMessageMutation]);

  // Voice command handlers
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleAutoSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (!message || sendMessageMutation.isPending) return;
    
    // Include image context if images are uploaded
    let messageWithContext = message;
    if (uploadedImages.length > 0) {
      messageWithContext = `${message}\n\n[User has uploaded ${uploadedImages.length} image(s) for analysis]`;
    }
    
    sendMessageMutation.mutate(messageWithContext);
  };

  const handleQRResult = (result: string) => {
    // Extract product ID from QR code result
    let productId = result;
    
    // If it's a URL, try to extract ID from it
    if (result.includes('product') || result.includes('id=')) {
      const urlMatch = result.match(/id=([^&]+)/);
      if (urlMatch) {
        productId = urlMatch[1];
      } else {
        // Try to extract from path
        const pathMatch = result.match(/\/product\/([^\/\?]+)/);
        if (pathMatch) {
          productId = pathMatch[1];
        }
      }
    }
    
    // Send message requesting product information
    const productInfoMessage = `Please provide information about product ID: ${productId}`;
    setInputMessage(productInfoMessage);
    
    toast({
      title: "QR Code Scanned",
      description: "Product information request prepared",
    });
  };

  const handleImagesUploaded = (images: Array<{ file: File; preview: string; base64: string }>) => {
    setUploadedImages(images);
    if (images.length > 0) {
      toast({
        title: "Images Uploaded",
        description: `${images.length} image(s) ready for analysis`,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-xl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary dark:text-white">
              {productId ? 'Product Assistant' : 'AI Assistant'}
            </h1>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {productId ? `Product ID: ${productId}` : 'Always here to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Voice Controls */}
          {speechSynthesisSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoSpeak}
              className={`p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                autoSpeak 
                  ? 'bg-primary/10 dark:bg-primary/10 border-primary/30' 
                  : 'bg-white dark:bg-gray-800'
              }`}
              title={autoSpeak ? "Disable voice responses" : "Enable voice responses"}
            >
              {autoSpeak ? (
                <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-primary animate-pulse' : 'text-primary'}`} />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          )}
          
          {speechRecognitionSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleListening}
              className={`p-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                isListening 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-white dark:bg-gray-800'
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="p-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            )}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-text-secondary dark:text-gray-400">Online</span>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth" style={{ maxHeight: "calc(100vh - 140px)" }}>
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="mb-6 text-center">
            <div className="inline-block bg-chat-bg dark:bg-gray-800 rounded-lg px-4 py-2 mb-2">
              <p className="text-sm text-text-secondary dark:text-gray-400">👋 Welcome! I'm your AI assistant. How can I help you today?</p>
            </div>
            <div className="mt-3 space-y-1 text-xs text-text-secondary dark:text-gray-500">
              {speechRecognitionSupported && (
                <p>🎤 Click the microphone to use voice input</p>
              )}
              {speechSynthesisSupported && (
                <p>🔊 Click the speaker to enable voice responses</p>
              )}
              <p>📷 Click the image icon to upload photos for analysis</p>
              <p>📱 Click the QR code icon to scan product QR codes</p>
              <p className="text-xs text-gray-400">Note: QR scanning requires camera permissions</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
            {message.sender === "ai" ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="bg-chat-bg dark:bg-gray-800 rounded-lg rounded-tl-none px-4 py-3 max-w-xs md:max-w-lg">
                    <p className="text-sm text-text-primary dark:text-white whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 ml-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1">
                  <div className="bg-primary rounded-lg rounded-tr-none px-4 py-3 max-w-xs md:max-w-md ml-auto">
                    <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1 mr-1 text-right">{formatTime(message.timestamp)}</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="bg-chat-bg dark:bg-gray-800 rounded-lg rounded-tl-none px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-text-secondary dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 bg-text-secondary dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-text-secondary dark:bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Image Upload Area */}
          {showImageUpload && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <ImageUpload onImagesUploaded={handleImagesUploaded} />
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening... speak now" : "Type your message here..."}
                className={`resize-none border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm min-h-[44px] max-h-[120px] overflow-hidden ${
                  isListening 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                } text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                rows={1}
                maxLength={1000}
                disabled={sendMessageMutation.isPending}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              
              {/* Character limit indicator */}
              <div className="absolute bottom-2 right-3 text-xs text-text-secondary dark:text-gray-400">
                <span>{inputMessage.length}</span>/1000
              </div>
            </div>
            
            {/* Upload Controls */}
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQRScanner(true)}
                className="p-2"
                title="Scan QR Code"
              >
                <QrCode className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className={`p-2 ${showImageUpload ? 'bg-primary/10 border-primary/30' : ''}`}
                title="Upload Images"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || sendMessageMutation.isPending || inputMessage.length > 1000}
              className="bg-primary hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-center h-[44px]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </Button>
          </div>
        </form>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScanResult={handleQRResult}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
