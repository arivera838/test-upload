'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Dropzone } from '../../components/upload/Dropzone';
import { FileUploadItem } from '../../components/upload/FileUploadItem';
import { FolderPlus, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'];

export default function UploadPage() {
  const { files, addFiles, removeFile, retryUpload, updateFileTags } = useFileUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(5, 'El título debe tener al menos 5 caracteres')
        .required('El título es obligatorio'),
      description: Yup.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .required('La descripción es obligatoria'),
    }),
    onSubmit: async (values) => {
      if (files.length === 0) return;

      setIsSubmitting(true);
      try {
        const payload = {
          title: values.title,
          description: values.description,
          files: files.map(f => ({
            id: f.id,
            name: f.file.name,
            size: f.file.size,
            type: f.file.type,
            url: f.remoteUrl,
            tags: f.tags
          }))
        };

        await axios.post('/api/submit', payload);
        alert('Formulario enviado con éxito a /api/submit');
        formik.resetForm();
      } catch (error) {
        alert('Error al enviar el formulario');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFilesAdded = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`El archivo ${file.name} supera los 5MB`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`El tipo de archivo ${file.type} no está permitido`);
        return false;
      }
      return true;
    });
    addFiles(validFiles);
  };

  const isUploading = files.some(f => f.status === 'uploading');
  const allDone = files.length > 0 && files.every(f => f.status === 'done');
  const canSubmit = formik.isValid && allDone && !isSubmitting && !isUploading;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">File Upload</h1>
            <p className="mt-2 text-gray-500 font-medium italic">Referencia visual integrada</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${allDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {files.filter(f => f.status === 'done').length} / {files.length} Done
            </span>
          </div>
        </header>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Table Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                <FolderPlus size={18} className="text-blue-600" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Document Manager</h2>
              </div>

              <div className="p-6">
                <Dropzone
                  onFilesAdded={handleFilesAdded}
                  maxFiles={10}
                  currentCount={files.length}
                />

                <div className="mt-8 overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Opciones</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nombre</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Tipo</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Etiquetas</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Creado Por</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {files.map(item => (
                        <FileUploadItem
                          key={item.id}
                          item={item}
                          onRemove={removeFile}
                          onRetry={retryUpload}
                          onUpdateTags={updateFileTags}
                        />
                      ))}
                    </tbody>
                  </table>

                  {files.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                      <div className="mb-4 rounded-full bg-gray-50 p-6 text-orange-400 ring-8 ring-gray-50/50">
                        <div className="relative">
                          <FolderPlus size={48} strokeWidth={1.5} />
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-orange-400 rounded-full animate-ping" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-700">No se han cargado archivos</h3>
                      <p className="text-sm text-gray-400 mt-1">Inicie arrastrando archivos en la zona de soltar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Details Section */}
          <div className="lg:col-span-4">
            <div className="sticky top-12 space-y-6">
              <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100 ring-1 ring-black/5">
                <h2 className="mb-6 text-xl font-bold text-gray-800 flex items-center gap-2">
                  Formulario de carga
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Titulo</label>
                    <input
                      type="text"
                      {...formik.getFieldProps('title')}
                      placeholder="Enter a descriptive title"
                      className={`mt-2 w-full rounded-xl border p-4 text-sm font-medium outline-none transition-all ${formik.touched.title && formik.errors.title ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
                        }`}
                    />
                    {formik.touched.title && formik.errors.title && (
                      <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">{formik.errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea
                      rows={5}
                      {...formik.getFieldProps('description')}
                      placeholder="Briefly explain the contents..."
                      className={`mt-2 w-full rounded-xl border p-4 text-sm font-medium outline-none transition-all ${formik.touched.description && formik.errors.description ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'
                        }`}
                    />
                    {formik.touched.description && formik.errors.description && (
                      <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-tighter">{formik.errors.description}</p>
                    )}
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`group relative w-full overflow-hidden rounded-xl py-4 text-sm font-black text-white transition-all ${canSubmit ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95' : 'cursor-not-allowed bg-gray-200'
                        }`}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Enviando...
                          </>
                        ) : 'Enviar Reporte'}
                      </div>
                      {canSubmit && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      )}
                    </button>

                    {!allDone && files.length > 0 && (
                      <p className="mt-4 text-center text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                        Carga en progreso... espere a todos los archivos.
                      </p>
                    )}
                    {files.length === 0 && formik.submitCount > 0 && (
                      <p className="mt-4 text-center text-[10px] text-red-500 font-bold uppercase tracking-wider">
                        Se requiere al menos un archivo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
