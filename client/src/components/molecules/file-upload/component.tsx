import Btn from '@/components/atoms/btn';
import Spinner from '@/components/atoms/spinner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { FileIcon, Upload, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export interface IFileUploadProps {
  onUpload: (files: File[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const FileUpload: React.FC<IFileUploadProps> = ({ onUpload, open, onOpenChange, children }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files];

      acceptedFiles.forEach((file) => {
        // Check if file already exists by name
        const exists = newFiles.some((f) => f.name === file.name);
        if (!exists) {
          newFiles.push(file);
        } else {
          toast.error('File name exists');
        }
      });

      // Limit to maxFiles
      setFiles(newFiles);
    },
    [files]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleUpload = () => {
    setIsLoading(true);
    onUpload(files);
    setFiles([]);
    setIsLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8 text-gray-500" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop files here, or click to select files'}
                </p>
              </div>
            </div>
          </div>
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Btn disabled={files.length === 0} onClick={handleUpload}>
            {isLoading ? <Spinner className="w-4 h-4" /> : 'Upload'}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { FileUpload };
