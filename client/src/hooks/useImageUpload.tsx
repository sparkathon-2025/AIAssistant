import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    file: File;
    preview: string;
    base64: string;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback((file: File): Promise<{
    file: File;
    preview: string;
    base64: string;
  }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Extract base64 data (remove data:image/...;base64, prefix)
          const base64 = result.split(',')[1];
          resolve({
            file,
            preview: result,
            base64
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const uploadImages = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    
    try {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length === 0) {
        throw new Error('No valid image files selected');
      }
      
      const processedImages = await Promise.all(
        imageFiles.map(file => processFile(file))
      );
      
      setUploadedImages(prev => [...prev, ...processedImages]);
      return processedImages;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [processFile]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  return {
    uploadedImages,
    isProcessing,
    uploadImages,
    removeImage,
    clearImages,
  };
};