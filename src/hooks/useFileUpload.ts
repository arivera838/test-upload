import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

export type FileStatus = 'pending' | 'uploading' | 'done' | 'error' | 'canceled' | 'idle';

export interface UploadableFile {
  id: string;
  file: File;
  progress: number;
  status: FileStatus;
  remoteUrl?: string;
  error?: string;
  tags?: string;
}

const CONCURRENCY_LIMIT = 2; // Límite de subidas simultáneas

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const abortControllers = useRef<{ [key: string]: AbortController }>({});

  const updateFileTags = useCallback((id: string, tags: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, tags } : f));
  }, []);

  const uploadSingleFile = useCallback(async (uploadable: UploadableFile) => {
    const controller = new AbortController();
    abortControllers.current[uploadable.id] = controller;

    setFiles(prev => prev.map(f => f.id === uploadable.id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f));

    const formData = new FormData();
    formData.append('file', uploadable.file);

    try {
      const response = await axios.post('/api/upload', formData, {
        signal: controller.signal,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setFiles(prev => prev.map(f => f.id === uploadable.id ? { ...f, progress } : f));
        },
      });

      setFiles(prev => prev.map(f => f.id === uploadable.id ? { ...f, status: 'done', progress: 100, remoteUrl: response.data.url } : f));
    } catch (error: any) {
      if (axios.isCancel(error)) {
        setFiles(prev => prev.map(f => f.id === uploadable.id ? { ...f, status: 'canceled' } : f));
      } else {
        let errorMessage = 'Error al subir';
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') errorMessage = detail;
        else if (Array.isArray(detail) && detail[0]?.msg) errorMessage = detail[0].msg;

        setFiles(prev => prev.map(f => f.id === uploadable.id ? { ...f, status: 'error', error: errorMessage } : f));
      }
    } finally {
      delete abortControllers.current[uploadable.id];
    }
  }, []);

  // Worker de Concurrencia
  useEffect(() => {
    const uploadingCount = files.filter(f => f.status === 'uploading').length;

    if (uploadingCount < CONCURRENCY_LIMIT) {
      const nextFile = files.find(f => f.status === 'idle');
      if (nextFile) {
        uploadSingleFile(nextFile);
      }
    }
  }, [files, uploadSingleFile]);

  const addFiles = useCallback((newFiles: File[]) => {
    const toAdd: UploadableFile[] = newFiles.map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
      progress: 0,
      status: 'idle', // Inician en espera
    }));

    setFiles(prev => {
      const filtered = toAdd.filter(newItem => !prev.some(existing => existing.file.name === newItem.file.name && existing.file.size === newItem.file.size));
      return [...prev, ...filtered];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    if (abortControllers.current[id]) abortControllers.current[id].abort();
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const retryUpload = useCallback((id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'idle', progress: 0 } : f));
  }, []);

  return { files, addFiles, removeFile, retryUpload, updateFileTags };
};
