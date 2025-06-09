import React from 'react';
import { Library, Clock, CheckCircle, XCircle, Check, Loader2, RefreshCw, Film, Sparkles, Server } from 'lucide-react';
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
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 text-xs font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  const handleVideoClick = (video: GeneratedVideo, event: React.MouseEvent) => {
    if (isSelectionMode && onVideoSelect && video.status === 'completed') {
      // Only trigger selection if clicking on the overlay area, not the video controls
      const target = event.target as HTMLElement;
      if (!target.closest('video') && !target.closest('[role="button"]')) {
        onVideoSelect(video.id);
      }
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
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs font-medium">
          <Server className="h-3 w-3 mr-1" />
          From Server
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs font-medium">
        <Sparkles className="h-3 w-3 mr-1" />
        New
      </Badge>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 animate-fade-in">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl">
              <Library className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Video Library</h2>
              <p className="text-indigo-600 text-sm font-medium">Your creative video collection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:ml-auto">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-sm font-medium px-3 py-1">
              <Film className="h-4 w-4 mr-1" />
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </Badge>
            
            {isSelectionMode && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 text-sm font-medium px-3 py-1">
                Selection Mode
              </Badge>
            )}
            
            {isLoadingVideos && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 border-cyan-300 text-sm font-medium px-3 py-1 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </Badge>
            )}
            
            {onRefreshVideos && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshVideos}
                disabled={isLoadingVideos}
                className="bg-white/80 border-indigo-300 text-indigo-700 hover:bg-indigo-50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingVideos ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {isLoadingVideos && videos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-cyan-300/50 shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-xl opacity-30 mx-auto animate-pulse"></div>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">Loading your videos</p>
              <p className="text-gray-500 text-sm">Fetching from server...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-indigo-300/50 shadow-lg">
                <Library className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-30 mx-auto"></div>
            </div>
            <p className="text-gray-700 text-xl font-medium mb-2">Your library is empty</p>
            <p className="text-gray-500 text-sm">Generate your first video to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <div 
                key={video.id} 
                className="group animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {video.status === 'completed' && video.videoUrl ? (
                  <div className="relative transition-all duration-300">
                    {/* Video Player - Always interactive */}
                    <div className="relative overflow-hidden rounded-2xl shadow-lg">
                      <VideoPlayer
                        videoUrl={video.videoUrl}
                        title={getVideoTitle(video)}
                        prompt={video.prompt}
                      />
                    </div>
                    
                    {/* Selection Overlay - Only when in selection mode */}
                    {isSelectionMode && (
                      <div 
                        className={`absolute inset-0 transition-all duration-300 rounded-2xl cursor-pointer ${
                          selectedVideoIds.includes(video.id)
                            ? 'bg-gradient-to-r from-cyan-400/40 to-purple-500/40 ring-2 ring-purple-500 shadow-lg shadow-purple-500/40'
                            : 'hover:bg-white/10 active:bg-white/20'
                        }`}
                        onClick={(e) => handleVideoClick(video, e)}
                        style={{ pointerEvents: 'auto' }}
                      >
                        {selectedVideoIds.includes(video.id) && (
                          <>
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full p-2 shadow-lg animate-pulse">
                              <Check className="h-4 w-4" />
                            </div>
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                              {selectedVideoIds.indexOf(video.id) + 1}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Video info badges - Always visible, positioned to not interfere */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                      {!isSelectionMode && (
                        <>
                          {getVideoType(video)}
                          {getStatusBadge(video.status)}
                        </>
                      )}
                    </div>

                    {/* Title overlay - Only show on hover when not in selection mode */}
                    {!isSelectionMode && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm truncate">
                            {getVideoTitle(video)}
                          </span>
                        </div>
                        <p className="text-white/90 text-xs line-clamp-2 leading-relaxed mt-1">
                          {video.prompt}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="bg-white/90 backdrop-blur-sm border-gray-200 overflow-hidden hover:bg-white transition-all duration-300 group shadow-lg">
                    <div className="relative">
                      <img
                        src={video.imageUrl}
                        alt="Source"
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <div className="mb-4">
                            {getStatusIcon(video.status)}
                          </div>
                          <p className="text-lg font-medium mb-2 opacity-90">
                            {video.status === 'processing' ? 'Generating Video...' : 'Generation Failed'}
                          </p>
                          <p className="text-sm opacity-70">
                            {video.status === 'processing' ? 'Please wait' : 'Try again'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-800 font-medium text-sm truncate mr-2">
                          {getVideoTitle(video)}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getVideoType(video)}
                          {getStatusBadge(video.status)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
                        {video.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoLibrary;
