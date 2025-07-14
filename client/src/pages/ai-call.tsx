import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Moon, Sun, Home } from "lucide-react";
import { Link } from "wouter";

export default function AICall() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  // Start AI call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsCallActive(true);
      setCallDuration(0);
      startCallTimer();
      
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to start the call",
        variant: "destructive",
      });
    }
  };

  // End AI call
  const endCall = () => {
    setIsCallActive(false);
    setIsRecording(false);
    setIsProcessing(false);
    setCallDuration(0);
    stopCallTimer();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Start recording voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioQuery(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  // Stop recording voice
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Send audio query to your API
  const sendAudioQuery = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'query.wav');
      
      // Replace with your actual API endpoint
      const response = await fetch('/api/ai-call', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio query');
      }

      const audioResponse = await response.blob();
      const audioURL = URL.createObjectURL(audioResponse);
      setAudioURL(audioURL);
      
      // Auto-play the response
      playAudioResponse(audioURL);
      
    } catch (error) {
      toast({
        title: "Query Failed",
        description: "Could not process your voice query",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio response
  const playAudioResponse = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      if(audioRef) audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio playback events
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Could not play audio response",
          variant: "destructive",
        });
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            <Home className="w-5 h-5 inline-block mr-1" />
          </Link>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Call</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Voice assistant hotline</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Phone Interface Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {/* Status Display */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Phone className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {isCallActive ? 'AI Assistant' : 'AI Call Ready'}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isCallActive 
                    ? `Call Duration: ${formatDuration(callDuration)}`
                    : 'Tap to start your voice conversation'
                  }
                </p>

                {/* Call Status Indicators */}
                <div className="flex justify-center space-x-4 mb-6">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    isCallActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span>{isCallActive ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                {/* Voice Recognition Feedback */}
                {isCallActive && isRecording  && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Listening</strong>
                    </p>
                  </div>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      🤖 AI is processing your query...
                    </p>
                  </div>
                )}

                {/* Playing Status */}
                {isPlaying && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      🔊 Playing AI response...
                    </p>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="space-y-4">
                {!isCallActive ? (
                  <Button
                    onClick={startCall}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    size="lg"
                  >
                    <PhoneCall className="w-6 h-6 mr-2" />
                    Start AI Call
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {/* Voice Recording Controls */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        className={`flex-1 font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        size="lg"
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-5 h-5 mr-2" />
                            Stop Query
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            {isProcessing ? 'Processing...' : 'Start Query'}
                          </>
                        )}
                      </Button>

                      {/* Audio Playback Control */}
                      {audioURL && (
                        <Button
                          onClick={() => playAudioResponse(audioURL)}
                          disabled={isPlaying}
                          className="px-4 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-lg"
                          size="lg"
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>

                    {/* End Call Button */}
                    <Button
                      onClick={endCall}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
                      size="lg"
                    >
                      <PhoneOff className="w-6 h-6 mr-2" />
                      End Call
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}