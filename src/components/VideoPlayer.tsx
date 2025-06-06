
import React from 'react';
import { Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${title.replace(/\s+/g, '_')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="overflow-hidden hover-scale">
      <div className="relative group">
        <video
          controls
          className="w-full aspect-video object-cover"
          poster="/placeholder.svg"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay with controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/90 hover:bg-white text-black"
          >
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{title}</h3>
            {prompt && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {prompt}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="shrink-0 hover-scale"
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
