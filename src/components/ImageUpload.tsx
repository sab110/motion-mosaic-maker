
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (file: File, prompt: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

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

    onUpload(selectedFile, prompt);
    setSelectedFile(null);
    setPreview(null);
    setPrompt('');
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
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
                className="max-h-48 mx-auto rounded-lg shadow-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedFile?.name} ({(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
                {isDragActive ? (
                  <Upload className="h-8 w-8 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your image here' : 'Click or drag to upload'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG or JPG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Video Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe how you want your image to animate... (e.g., 'Make the ocean waves move gently', 'Add falling snow', 'Make the person walk forward')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Be specific about the motion and effects you want to see in your video.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || !prompt.trim() || disabled}
        className="w-full hover-scale"
        size="lg"
      >
        {disabled ? 'Generating...' : 'Generate Video'}
      </Button>
    </div>
  );
};

export default ImageUpload;
