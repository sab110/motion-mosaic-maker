
import React, { useState } from 'react';
import { Combine, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VideoPlayer from './VideoPlayer';
import { GeneratedVideo } from '../pages/Index';

interface VideoCombinerProps {
  videos: GeneratedVideo[];
  onCombine: (selectedIds: string[]) => void;
  isCombining: boolean;
  combinedVideoUrl: string | null;
  selectedVideoIds: string[];
}

const VideoCombiner: React.FC<VideoCombinerProps> = ({
  videos,
  onCombine,
  isCombining,
  combinedVideoUrl,
  selectedVideoIds
}) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  const handleVideoSelect = (videoId: string) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else if (prev.length < 5) {
        return [...prev, videoId];
      } else {
        return prev;
      }
    });
  };

  const handleCombine = () => {
    onCombine(localSelectedIds);
  };

  const canCombine = localSelectedIds.length >= 2 && localSelectedIds.length <= 5;

  return (
    <Card className="p-6 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Combine className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Combine Videos</h2>
          <Badge variant="outline" className="ml-2">
            Select 2-5 videos
          </Badge>
        </div>
        <Button 
          onClick={handleCombine}
          disabled={!canCombine || isCombining}
          className="hover-scale"
        >
          {isCombining ? 'Combining...' : `Combine ${localSelectedIds.length} Videos`}
        </Button>
      </div>
      
      {/* Selection Instructions */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Select {localSelectedIds.length < 2 ? `${2 - localSelectedIds.length} more` : 'between 2-5'} videos to combine them into a single video.
          Selected: <span className="font-medium text-foreground">{localSelectedIds.length}/5</span>
        </p>
      </div>

      {/* Video Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {videos.map((video) => (
          <div key={video.id} className="relative">
            <Card 
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                localSelectedIds.includes(video.id)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleVideoSelect(video.id)}
            >
              <div className="relative">
                <video
                  className="w-full aspect-video object-cover"
                  poster="/placeholder.svg"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
                
                {/* Selection Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                  localSelectedIds.includes(video.id)
                    ? 'bg-primary/20'
                    : 'bg-black/0 hover:bg-black/10'
                }`}>
                  {localSelectedIds.includes(video.id) && (
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                {/* Selection Number */}
                {localSelectedIds.includes(video.id) && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {localSelectedIds.indexOf(video.id) + 1}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h4 className="font-medium text-sm truncate">Video {video.id}</h4>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {video.prompt}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Combined Video Display */}
      {combinedVideoUrl && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Combined Video Result
          </h3>
          <div className="max-w-2xl">
            <VideoPlayer 
              videoUrl={combinedVideoUrl} 
              title="Combined Video"
              prompt="Combined from selected videos"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default VideoCombiner;
