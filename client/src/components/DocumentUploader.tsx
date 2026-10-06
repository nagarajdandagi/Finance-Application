import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, Eye } from 'lucide-react';

interface DocumentUploaderProps {
  label: string;
  description?: string;
  required?: boolean;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  uploadedUrl?: string;
  onView?: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  description,
  required = false,
  onFileSelect,
  selectedFile,
  onView
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format! Please upload PDF, JPG, JPEG, or PNG.');
      return;
    }
    if (file.size > maxSizeBytes) {
      setError('File is too large! Maximum allowed size is 10MB.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="block text-xs font-semibold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {description && <span className="text-[11px] text-slate-400">{description}</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-800 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to submit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition"
              title="Remove File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : error
              ? 'border-rose-300 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-6 h-6 mx-auto text-slate-400 mb-1" />
          <p className="text-xs font-semibold text-slate-700">
            Click to upload or drag & drop
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            PDF, JPG, JPEG, PNG (Max 10 MB)
          </p>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};
