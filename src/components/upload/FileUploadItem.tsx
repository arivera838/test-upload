import React from 'react';
import { UploadableFile } from '../../hooks/useFileUpload';
import { Trash2, RefreshCw, Calendar, User, FileText } from 'lucide-react';

interface FileUploadItemProps {
  item: UploadableFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onUpdateTags: (id: string, tags: string) => void;
}

export const FileUploadItem: React.FC<FileUploadItemProps> = ({ item, onRemove, onRetry, onUpdateTags }) => {
  const currentDate = new Date().toLocaleDateString();
  const mockUser = "User Test 4";

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
          {item.status === 'error' && (
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              className="text-orange-500 hover:text-orange-700"
              title="Reintentar"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer truncate max-w-[200px]">
            {item.file.name}
          </span>
          {item.status === 'uploading' && (
            <div className="mt-1 h-1 w-full rounded-full bg-gray-100">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${item.progress}%` }} 
              />
            </div>
          )}
          {item.status === 'error' && (
             <span className="text-[10px] text-red-500">
               {typeof item.error === 'object' ? JSON.stringify(item.error) : item.error}
             </span>
          )}
          {item.status === 'done' && <span className="text-[10px] text-green-500">Cargado con éxito</span>}
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-500">
        {item.file.type || 'application/octet-stream'}
      </td>

      <td className="px-4 py-3">
        <select
          value={item.tags || ''}
          onChange={(e) => onUpdateTags(item.id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white p-1.5 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="">Seleccionar...</option>
          <option value="legal">Legal</option>
          <option value="tecnico">Técnico</option>
          <option value="seguridad">Seguridad</option>
        </select>
      </td>

      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          {currentDate}
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 uppercase">
            {mockUser.charAt(0)}
          </div>
          {mockUser}
        </div>
      </td>
    </tr>
  );
};
