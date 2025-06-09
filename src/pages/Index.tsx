import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import ImageUpload from '../components/ImageUpload';
import VideoPlayer from '../components/VideoPlayer';
import ProcessingStatus from '../components/ProcessingStatus';
import VideoLibrary from '../components/VideoLibrary';
import VideoCombiner from '../components/VideoCombiner';
import { Video, Combine, Sparkles, Wand2, Stars, Play } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="relative p-3 sm:p-4 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-sm rounded-3xl border border-cyan-200/50 shadow-2xl">
              <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                Real Estate 
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Video Generator
              </h2>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed">
            Transform your images into stunning videos with cutting-edge AI technology. 
            <br className="hidden sm:block" />
            Upload, create, and combine with professional quality results.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Stars className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600 font-medium">Powered by RunwayML Gen-3 Alpha Turbo</span>
            <Stars className="h-4 w-4 text-yellow-500" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10 mb-10 sm:mb-16">
          {/* Upload Section */}
          <Card className="bg-white/70 backdrop-blur-xl border-cyan-200/50 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 animate-fade-in group hover:bg-white/80" style={{ animationDelay: '0.1s' }}>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-cyan-700 transition-colors">
                  Create Video
                </h2>
              </div>
              <ImageUpload onUpload={handleImageUpload} disabled={isProcessing} />
            </div>
          </Card>

          {/* Processing Status */}
          <Card className="bg-white/70 backdrop-blur-xl border-purple-200/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 animate-fade-in group hover:bg-white/80" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                  Processing Status
                </h2>
              </div>
              <ProcessingStatus 
                isProcessing={isProcessing}
                currentVideo={videos.find(v => v.status === 'processing')}
              />
            </div>
          </Card>
        </div>

        {/* Video Combination Section */}
        {completedVideos.length > 1 && !isSelectionMode && (
          <Card className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 backdrop-blur-xl border-emerald-300/50 shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 p-6 sm:p-8 mb-8 sm:mb-12 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-xl">
                  <Combine className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Combine Videos</h2>
                  <p className="text-emerald-700 text-sm font-medium">Create seamless video sequences</p>
                </div>
              </div>
              <Button 
                onClick={handleStartSelection} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Select Videos to Combine
              </Button>
            </div>
          </Card>
        )}

        {/* Selection Mode Header */}
        {isSelectionMode && (
          <Card className="bg-gradient-to-r from-orange-100/80 to-yellow-100/80 backdrop-blur-xl border-orange-300/50 shadow-2xl p-6 sm:p-8 mb-8 sm:mb-12 animate-fade-in">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/30 to-yellow-600/30 rounded-xl">
                    <Combine className="h-6 w-6 sm:h-7 sm:w-7 text-orange-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Select Videos to Combine</h2>
                    <span className="text-orange-700 text-sm font-medium">
                      {selectedVideoIds.length} of 5 videos selected
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleCancelSelection}
                  className="bg-white/80 border-orange-300 text-orange-700 hover:bg-orange-50 backdrop-blur-sm transition-all duration-300"
                  size="lg"
                >
                  Cancel Selection
                </Button>
                <Button 
                  onClick={() => handleCombineVideos(selectedVideoIds)}
                  disabled={selectedVideoIds.length < 2 || isCombining}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 shadow-lg hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {isCombining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Combining...
                    </>
                  ) : (
                    <>
                      <Combine className="h-5 w-5 mr-2" />
                      Combine {selectedVideoIds.length} Videos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Combined Video Display */}
        {combinedVideoUrl && (
          <Card className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-xl border-green-300/50 shadow-2xl p-6 sm:p-8 mb-8 sm:mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-xl">
                <Combine className="h-6 w-6 sm:h-7 sm:w-7 text-green-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Combined Video Result</h3>
                <p className="text-green-700 text-sm font-medium">Your videos have been seamlessly combined</p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
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
