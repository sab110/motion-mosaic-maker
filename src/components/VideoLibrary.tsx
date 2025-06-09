import React from 'react';
import { Library, Clock, CheckCircle, XCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import { GeneratedVideo } from '../pages/Index';

interface VideoLibraryProps {
  videos: GeneratedVideo[];
  selectedVideoIds?: string[];
  onVideoSelect?: (videoId: string) => void;
  isSelectionMode?: boolean;
  isLoadingVideos?: boolean;
  onRefreshVideos?: () => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ 
  videos, 
  selectedVideoIds = [], 
  onVideoSelect,
  isSelectionMode = false,
  isLoadingVideos = false,
  onRefreshVideos
}) => {
  const getStatusIcon = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
    }
  };

  const handleVideoClick = (video: GeneratedVideo) => {
    if (isSelectionMode && onVideoSelect && video.status === 'completed') {
      onVideoSelect(video.id);
    }
  };

  const getVideoTitle = (video: GeneratedVideo) => {
    if (video.id.startsWith('server-')) {
      // Extract filename from server videos
      const filename = video.id.split('-')[1];
      return filename || `Server Video ${video.id.slice(-4)}`;
    }
    return `Video ${video.id}`;
  };

  const getVideoType = (video: GeneratedVideo) => {
    if (video.id.startsWith('server-')) {
      return <Badge variant="outline" className="text-xs">From Server</Badge>;
    }
    return <Badge variant="outline" className="text-xs">New</Badge>;
  };

  return (
    <Card className="p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-semibold">Video Library</h2>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Badge variant="outline" className="text-xs">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </Badge>
          {isSelectionMode && (
            <Badge variant="secondary" className="text-xs">
              Selection Mode
            </Badge>
          )}
          {isLoadingVideos && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </Badge>
          )}
          {onRefreshVideos && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshVideos}
              disabled={isLoadingVideos}
              className="ml-auto flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingVideos ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {isLoadingVideos && videos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading videos from server...</p>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Library className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No videos yet. Generate your first video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div key={video.id} className="space-y-2 sm:space-y-3">
              {video.status === 'completed' && video.videoUrl ? (
                <div 
                  className={`relative ${isSelectionMode ? 'cursor-pointer touch-manipulation' : ''}`}
                  onClick={() => handleVideoClick(video)}
                >
                  <VideoPlayer
                    videoUrl={video.videoUrl}
                    title={getVideoTitle(video)}
                    prompt={video.prompt}
                  />
                  
                  {/* Selection Overlay for completed videos in selection mode */}
                  {isSelectionMode && (
                    <>
                      <div className={`absolute inset-0 transition-all duration-200 ${
                        selectedVideoIds.includes(video.id)
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'bg-black/0 hover:bg-black/10 active:bg-black/20'
                      } rounded-lg`} />
                      
                      {selectedVideoIds.includes(video.id) && (
                        <>
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-primary text-primary-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-medium">
                            {selectedVideoIds.indexOf(video.id) + 1}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={video.imageUrl}
                      alt="Source"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        {getStatusIcon(video.status)}
                        <p className="text-xs sm:text-sm mt-2">
                          {video.status === 'processing' ? 'Generating...' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">{getVideoTitle(video)}</span>
                      <div className="flex items-center gap-1">
                        {getVideoType(video)}
                        {getStatusBadge(video.status)}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {video.prompt}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Duration: {video.duration}s
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default VideoLibrary;
