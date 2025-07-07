import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesUploaded: (images: Array<{ file: File; preview: string; base64: string }>) => void;
  maxImages?: number;
}

export const ImageUpload = ({ onImagesUploaded, maxImages = 5 }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedImages, isProcessing, uploadImages, removeImage, clearImages } = useImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const newImages = await uploadImages(files);
        onImagesUploaded(uploadedImages.concat(newImages));
      } catch (error) {
        console.error('Failed to upload images:', error);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    removeImage(index);
    onImagesUploaded(uploadedImages.filter((_, i) => i !== index));
  };

  const canUploadMore = uploadedImages.length < maxImages;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isProcessing || !canUploadMore}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isProcessing ? 'Processing...' : 'Upload Images'}
        </Button>

        {uploadedImages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clearImages();
              onImagesUploaded([]);
            }}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </Button>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                {image.file.name.substring(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length >= maxImages && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          Maximum {maxImages} images allowed
        </p>
      )}
    </div>
  );
};