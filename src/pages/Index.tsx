
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import ImageUpload from '../components/ImageUpload';
import VideoPlayer from '../components/VideoPlayer';
import ProcessingStatus from '../components/ProcessingStatus';
import VideoLibrary from '../components/VideoLibrary';
import { Video, Combine, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface GeneratedVideo {
  id: string;
  imageUrl: string;
  prompt: string;
  videoUrl?: string;
  status: 'processing' | 'completed' | 'error';
  createdAt: Date;
}

const Index = () => {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [combinedVideoUrl, setCombinedVideoUrl] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File, prompt: string) => {
    const newVideo: GeneratedVideo = {
      id: Date.now().toString(),
      imageUrl: URL.createObjectURL(file),
      prompt,
      status: 'processing',
      createdAt: new Date(),
    };

    setVideos(prev => [newVideo, ...prev]);
    setIsProcessing(true);

    try {
      // Simulate API call to FastAPI backend
      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', prompt);

      // For demo purposes, we'll simulate the API call
      setTimeout(() => {
        setVideos(prev => prev.map(v => 
          v.id === newVideo.id 
            ? { ...v, status: 'completed' as const, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
            : v
        ));
        setIsProcessing(false);
        toast.success('Video generated successfully!');
      }, 5000);

    } catch (error) {
      console.error('Error generating video:', error);
      setVideos(prev => prev.map(v => 
        v.id === newVideo.id ? { ...v, status: 'error' as const } : v
      ));
      setIsProcessing(false);
      toast.error('Failed to generate video');
    }
  }, []);

  const handleCombineVideos = useCallback(async () => {
    const completedVideos = videos.filter(v => v.status === 'completed');
    
    if (completedVideos.length < 2) {
      toast.error('You need at least 2 completed videos to combine');
      return;
    }

    setIsCombining(true);

    try {
      // Simulate API call to combine videos
      setTimeout(() => {
        setCombinedVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
        setIsCombining(false);
        toast.success('Videos combined successfully!');
      }, 3000);
    } catch (error) {
      console.error('Error combining videos:', error);
      setIsCombining(false);
      toast.error('Failed to combine videos');
    }
  }, [videos]);

  const completedVideos = videos.filter(v => v.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wand2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Video Generator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your images into stunning videos with AI. Upload an image, add a prompt, and watch the magic happen.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Section */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Create Video</h2>
            </div>
            <ImageUpload onUpload={handleImageUpload} disabled={isProcessing} />
          </Card>

          {/* Processing Status */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Processing Status</h2>
            </div>
            <ProcessingStatus 
              isProcessing={isProcessing}
              currentVideo={videos.find(v => v.status === 'processing')}
            />
          </Card>
        </div>

        {/* Video Combination Section */}
        {completedVideos.length > 0 && (
          <Card className="p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Combine className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Combine Videos</h2>
              </div>
              <Button 
                onClick={handleCombineVideos}
                disabled={isCombining || completedVideos.length < 2}
                className="hover-scale"
              >
                {isCombining ? 'Combining...' : `Combine ${completedVideos.length} Videos`}
              </Button>
            </div>
            
            {combinedVideoUrl && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-3">Combined Video</h3>
                <VideoPlayer videoUrl={combinedVideoUrl} title="Combined Video" />
              </div>
            )}
          </Card>
        )}

        {/* Video Library */}
        {videos.length > 0 && (
          <VideoLibrary videos={videos} />
        )}
      </div>
    </div>
  );
};

export default Index;
