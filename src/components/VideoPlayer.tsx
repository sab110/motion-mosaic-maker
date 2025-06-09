import React, { useState, useEffect } from 'react';
import { Download, Play, AlertCircle, Loader2 } from 'lucide-react';
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
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch video');
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
    if (retryCount < 2) {
      console.log(`Retrying video load (attempt ${retryCount + 1}/2)`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setVideoError(false);
        setIsLoading(true);
        // Force reload the video element
        const video = e.currentTarget;
        video.load();
      }, 1000);
    } else {
      setVideoError(true);
      toast.error('Video failed to load. You can still download it.');
    }
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play:', videoUrl);
    setIsLoading(false);
    setVideoError(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative group">
        {videoError ? (
          <div className="w-full aspect-video bg-muted flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">Video preview unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">Use download button to save</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="mt-3"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              key={`${videoUrl}-${retryCount}`} // Force re-render on retry
              controls
              className="w-full aspect-video object-cover bg-black"
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              preload="metadata"
              playsInline // Important for mobile
              controlsList="nodownload" // Prevent browser download
              src={videoUrl} // Explicitly set src
              crossOrigin="anonymous" // Handle CORS if needed
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {isLoading && (
              <div className="absolute inset-0 bg-muted/80 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Loading video...</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-muted-foreground">Retry {retryCount}/2</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-sm sm:text-base">{title}</h3>
            {prompt && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {prompt}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Video URL: {videoUrl}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="shrink-0 w-full sm:w-auto hover:shadow-md transition-shadow"
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
