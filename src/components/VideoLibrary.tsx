
import React from 'react';
import { Library, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VideoPlayer from './VideoPlayer';
import { GeneratedVideo } from '../pages/Index';

interface VideoLibraryProps {
  videos: GeneratedVideo[];
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos }) => {
  const getStatusIcon = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold">Video Library</h2>
        <Badge variant="outline" className="ml-2">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="space-y-3">
            {video.status === 'completed' && video.videoUrl ? (
              <VideoPlayer
                videoUrl={video.videoUrl}
                title={`Video ${video.id}`}
                prompt={video.prompt}
              />
            ) : (
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src={video.imageUrl}
                    alt="Source"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      {getStatusIcon(video.status)}
                      <p className="text-sm mt-2">
                        {video.status === 'processing' ? 'Generating...' : 'Failed'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Video {video.id}</span>
                    {getStatusBadge(video.status)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.prompt}
                  </p>
                </div>
              </Card>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VideoLibrary;
