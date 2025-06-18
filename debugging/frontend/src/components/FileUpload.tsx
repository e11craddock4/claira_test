import React, { useState } from 'react';
import { apiService } from '../services/api';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const response = await apiService.uploadCSV(file);
      setMessage(response.data.message);
      setFile(null);
      onUploadSuccess();

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Upload Transaction CSV
      </h2>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select CSV file
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 dark:file:bg-gray-700
            file:text-blue-700 dark:file:text-blue-300
            hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
        />
      </div>

      {file && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Selected: {file.name}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.includes('Successfully')
              ? 'bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800'
              : 'bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Expected CSV format:</p>
        <ul className="list-disc list-inside mt-1">
          <li>date (YYYY-MM-DD or MM/DD/YYYY)</li>
          <li>description</li>
          <li>amount (negative for expenses)</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
