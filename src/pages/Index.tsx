import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '../components/ImageUpload';
import VideoPlayer from '../components/VideoPlayer';
import ProcessingStatus from '../components/ProcessingStatus';
import VideoLibrary from '../components/VideoLibrary';
import VideoCombiner from '../components/VideoCombiner';
import { Video, Combine, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface GeneratedVideo {
  id: string;
  imageUrl: string;
  prompt: string;
  duration: number;
  videoUrl?: string;
  status: 'processing' | 'completed' | 'error';
  createdAt: Date;
}

// API configuration - using deployed backend
const API_BASE_URL = 'https://videogen-ai.hzadeducationclb.com';

const Index = () => {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [combinedVideoUrl, setCombinedVideoUrl] = useState<string | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // Fetch existing videos from server on component mount
  const fetchExistingVideos = useCallback(async () => {
    try {
      setIsLoadingVideos(true);
      const response = await fetch(`${API_BASE_URL}/list-videos`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Existing videos from server:', result);
        
        if (result.success && result.videos) {
          // Convert server videos to our format
          const serverVideos: GeneratedVideo[] = result.videos.map((video: any, index: number) => ({
            id: `server-${video.filename}-${index}`,
            imageUrl: '/placeholder-image.jpg', // We don't have source images for server videos
            prompt: 'Previously generated video',
            duration: 10, // Default duration
            videoUrl: `${API_BASE_URL}${video.url}`,
            status: 'completed' as const,
            createdAt: new Date(video.created_timestamp * 1000),
          }));
          
          setVideos(serverVideos);
          console.log(`Loaded ${serverVideos.length} existing videos from server`);
        }
      } else {
        console.warn('Failed to fetch existing videos:', response.status);
      }
    } catch (error) {
      console.error('Error fetching existing videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  }, []);

  // Fetch videos on component mount
  useEffect(() => {
    fetchExistingVideos();
  }, [fetchExistingVideos]);

  const handleImageUpload = useCallback(async (file: File, prompt: string, duration: number) => {
    const newVideo: GeneratedVideo = {
      id: Date.now().toString(),
      imageUrl: URL.createObjectURL(file),
      prompt,
      duration,
      status: 'processing',
      createdAt: new Date(),
    };

    // Add new video to the beginning of the list
    setVideos(prev => [newVideo, ...prev]);
    setIsProcessing(true);

    try {
      // FastAPI integration - real API call
      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', prompt);
      formData.append('duration', duration.toString());

      const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to generate video');
      }
      
      // Handle JSON response with video URL
      const result = await response.json();
      console.log('Video generation result:', result);
      
      // Construct the full video URL
      const videoUrl = `${API_BASE_URL}${result.video_url}`;
      console.log('Constructed video URL:', videoUrl);
      
      setVideos(prev => prev.map(v => 
        v.id === newVideo.id 
          ? { ...v, status: 'completed' as const, videoUrl }
          : v
      ));
      setIsProcessing(false);
      toast.success('Video generated successfully!');

    } catch (error) {
      console.error('Error generating video:', error);
      setVideos(prev => prev.map(v => 
        v.id === newVideo.id ? { ...v, status: 'error' as const } : v
      ));
      setIsProcessing(false);
      toast.error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideoIds(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else if (prev.length < 5) {
        return [...prev, videoId];
      } else {
        toast.error('You can select maximum 5 videos');
        return prev;
      }
    });
  }, []);

  const handleCombineVideos = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length < 2 || selectedIds.length > 5) {
      toast.error('Please select 2-5 videos to combine');
      return;
    }

    setIsCombining(true);

    try {
      const selectedVideos = videos.filter(v => selectedIds.includes(v.id) && v.status === 'completed');
      
      if (selectedVideos.length !== selectedIds.length) {
        throw new Error('Some selected videos are not available or still processing');
      }

      // Create FormData to send video files to backend
      const formData = new FormData();
      
      // Download videos from their URLs and add to FormData
      for (let i = 0; i < selectedVideos.length; i++) {
        const video = selectedVideos[i];
        if (video.videoUrl) {
          try {
            console.log(`Fetching video ${i + 1} from:`, video.videoUrl);
            // Fetch the video from the server URL
            const response = await fetch(video.videoUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch video ${i + 1}: ${response.status}`);
            }
            const videoBlob = await response.blob();
            
            // Create a proper file from the blob
            const videoFile = new File([videoBlob], `video_${i}.mp4`, { type: 'video/mp4' });
            formData.append('videos', videoFile);
          } catch (error) {
            console.error(`Failed to fetch video ${i}:`, error);
            throw new Error(`Failed to prepare video ${i + 1} for combination`);
          }
        }
      }

      // Make API call to backend
      const response = await fetch(`${API_BASE_URL}/combine-videos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to combine videos');
      }
      
      // Handle JSON response with combined video URL
      const result = await response.json();
      console.log('Video combination result:', result);
      
      const combinedVideoUrl = `${API_BASE_URL}${result.video_url}`;
      console.log('Constructed combined video URL:', combinedVideoUrl);
      
      setCombinedVideoUrl(combinedVideoUrl);
      setIsCombining(false);
      setSelectedVideoIds([]);
      setIsSelectionMode(false);
      toast.success(`${selectedIds.length} videos combined successfully!`);

    } catch (error) {
      console.error('Error combining videos:', error);
      setIsCombining(false);
      toast.error(`Failed to combine videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [videos]);

  const handleStartSelection = () => {
    setIsSelectionMode(true);
    setSelectedVideoIds([]);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedVideoIds([]);
  };

  const completedVideos = videos.filter(v => v.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
              <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Video Generator
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Transform your images into stunning videos with AI. Upload an image, add a prompt, and watch the magic happen.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Upload Section */}
          <Card className="p-4 sm:p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Create Video</h2>
            </div>
            <ImageUpload onUpload={handleImageUpload} disabled={isProcessing} />
          </Card>

          {/* Processing Status */}
          <Card className="p-4 sm:p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Processing Status</h2>
            </div>
            <ProcessingStatus 
              isProcessing={isProcessing}
              currentVideo={videos.find(v => v.status === 'processing')}
            />
          </Card>
        </div>

        {/* Video Combination Section */}
        {completedVideos.length > 1 && !isSelectionMode && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Combine className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">Combine Videos</h2>
              </div>
              <Button 
                onClick={handleStartSelection} 
                className="w-full sm:w-auto hover:shadow-md transition-shadow"
                size="sm"
              >
                Select Videos to Combine
              </Button>
            </div>
          </Card>
        )}

        {/* Selection Mode Header */}
        {isSelectionMode && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Combine className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">Select Videos to Combine</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({selectedVideoIds.length}/5 selected)
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelSelection}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleCombineVideos(selectedVideoIds)}
                  disabled={selectedVideoIds.length < 2 || isCombining}
                  className="w-full sm:w-auto hover:shadow-md transition-shadow"
                  size="sm"
                >
                  {isCombining ? 'Combining...' : `Combine ${selectedVideoIds.length} Videos`}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Combined Video Display */}
        {combinedVideoUrl && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Combine className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Combined Video Result
            </h3>
            <div className="max-w-full sm:max-w-2xl">
              <VideoPlayer 
                videoUrl={combinedVideoUrl} 
                title="Combined Video"
                prompt="Combined from selected videos"
              />
            </div>
          </Card>
        )}

        {/* Video Library */}
        {(videos.length > 0 || isLoadingVideos) && (
          <VideoLibrary 
            videos={videos}
            selectedVideoIds={selectedVideoIds}
            onVideoSelect={handleVideoSelect}
            isSelectionMode={isSelectionMode}
            isLoadingVideos={isLoadingVideos}
            onRefreshVideos={fetchExistingVideos}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
