import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (file: File, prompt: string, duration: number) => void;
  disabled?: boolean;
}

const DEFAULT_PROMPT = "Transform this front exterior photo of an aged, distressed residential home into a fully renovated and modern property ready for resale. Enhance the exterior by repairing the siding, refreshing the paint with neutral colors, updating roofing and paneling, and landscaping the front yard with lush grass and flowers. For the interior, envision a complete renovation: Off-white eggshell painted walls throughout the home Mahogany cabinetry and granite countertops in the kitchen Stainless steel appliances including stove, oven, and fridge Hardwood flooring in living areas and bedrooms Modern fixtures and recessed lighting in all rooms Clean, stylish bathrooms with updated vanities and tile flooring Show a polished, move-in-ready home that appeals to prospective buyers and reflects the full scope of a fix-and-flip upgrade.";

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(10);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        toast.error('File size must be less than 10MB');
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        toast.error('Only PNG and JPG files are allowed');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled,
  });

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (duration !== 5 && duration !== 10) {
      toast.error('Duration must be 5 or 10 seconds');
      return;
    }

    onUpload(selectedFile, prompt, duration);
    setSelectedFile(null);
    setPreview(null);
    setPrompt('');
    setDuration(10);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  const useDefaultPrompt = () => {
    setPrompt(DEFAULT_PROMPT);
    toast.success('Default real estate prompt applied!');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} id="image-upload" />
          
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 sm:max-h-48 mx-auto rounded-lg shadow-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 sm:top-2 sm:right-2 h-8 w-8 sm:h-10 sm:w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-muted/30 rounded-full w-fit mx-auto">
                {isDragActive ? (
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-base sm:text-lg font-medium">
                  {isDragActive ? 'Drop your image here' : 'Click or drag to upload'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  PNG or JPG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <Label htmlFor="prompt">Video Prompt</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useDefaultPrompt}
            disabled={disabled}
            className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Use Real Estate Default
          </Button>
        </div>
        <Textarea
          id="prompt"
          placeholder="Describe how you want your image to animate... (e.g., 'Make the ocean waves move gently', 'Add falling snow', 'Transform this house into a modern property')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Be specific about the motion and effects you want to see in your video. Use the default prompt for real estate transformations.
        </p>
      </div>

      {/* Duration Selection */}
      <div className="space-y-2">
        <Label htmlFor="duration" className="flex items-center gap-2">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          Video Duration
        </Label>
        <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))} disabled={disabled}>
          <SelectTrigger className="w-full h-10 sm:h-11">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 seconds</SelectItem>
            <SelectItem value="10">10 seconds</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose between 5 or 10 seconds. Longer videos take more time to generate.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || !prompt.trim() || disabled}
        className="w-full hover:shadow-md transition-shadow h-11 sm:h-12"
        size="lg"
      >
        {disabled ? 'Generating...' : 'Generate Video'}
      </Button>
    </div>
  );
};

export default ImageUpload;
