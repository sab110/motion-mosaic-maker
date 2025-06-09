import React, { useState, useEffect, useRef } from 'react';
import { Download, Play, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  prompt?: string;
  onDownload?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  prompt,
  onDownload 
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force video reload when URL changes
  useEffect(() => {
    console.log('VideoPlayer URL changed:', videoUrl);
    setVideoError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [videoUrl]);

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      try {
        // For any URL, fetch and download
        const response = await fetch(videoUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Video download started!');
      } catch (error) {
        toast.error('Failed to download video');
        console.error('Download error:', error);
      }
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', videoUrl);
    setIsLoading(false);
    setVideoError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video playback error for URL:', videoUrl, e);
    setIsLoading(false);
    
    // Try to retry a few times before giving up
    if (retryCount < 3) {
      console.log(`Retrying video load (attempt ${retryCount + 1}/3)`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setVideoError(false);
        setIsLoading(true);
        // Force reload the video element
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 1500);
    } else {
      setVideoError(true);
      toast.error('Video failed to load. Check the URL or try downloading.');
    }
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play:', videoUrl);
    setIsLoading(false);
    setVideoError(false);
  };

  const handleRetry = () => {
    setVideoError(false);
    setIsLoading(true);
    setRetryCount(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/90 border-gray-200">
      <div className="relative group">
        {videoError ? (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-gray-700 font-medium mb-1">Video playback failed</p>
              <p className="text-xs text-gray-500 mb-4">The video may be processing or there's a connection issue</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              key={`${videoUrl}-${retryCount}`} // Force re-render on retry
              controls
              className="w-full aspect-video object-cover bg-black rounded-t-lg"
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              preload="metadata"
              playsInline // Important for mobile
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture={false}
              autoPlay={false}
              muted={false}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center pointer-events-none rounded-t-lg">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 font-medium">Loading video...</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-gray-500">Attempt {retryCount + 1}/4</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-3 sm:p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-sm sm:text-base text-gray-800">{title}</h3>
            {prompt && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                {prompt}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="shrink-0 w-full sm:w-auto hover:shadow-md transition-shadow bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VideoPlayer;
