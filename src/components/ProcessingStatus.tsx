
import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GeneratedVideo } from '../pages/Index';

interface ProcessingStatusProps {
  isProcessing: boolean;
  currentVideo?: GeneratedVideo;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  isProcessing, 
  currentVideo 
}) => {
  if (!isProcessing && !currentVideo) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          Upload an image to start generating your video
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isProcessing && currentVideo && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary">Processing Video</h3>
              <p className="text-sm text-muted-foreground truncate">
                {currentVideo.prompt}
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">Generating...</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Analyzing image content</p>
            <p>• Applying AI motion effects</p>
            <p>• Rendering high-quality video</p>
          </div>
        </Card>
      )}

      {/* Processing Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm">Image uploaded successfully</span>
        </div>
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          <span className="text-sm">AI analysis in progress</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Video rendering</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
