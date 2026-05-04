import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles: number;
  currentCount: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, maxFiles, currentCount }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  }, [onFilesAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const isDisabled = currentCount >= maxFiles;

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
      } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:bg-white'}`}
      onClick={() => !isDisabled && document.getElementById('fileInput')?.click()}
      role="button"
      aria-label="Subir archivos"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !isDisabled && document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        disabled={isDisabled}
      />
      
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600">
          <UploadCloud size={24} />
        </div>
        <p className="text-sm font-bold text-gray-700">
          {isDragging ? '¡Suéltalos ahora!' : 'Drag and drop your files here or click to select them'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Accepted files: pdf, image, zip • Max files allowed: {maxFiles}
        </p>
      </div>
    </div>
  );
};
