'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, XCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

interface ImportResult {
  row: number;
  success: boolean;
  product_id?: string;
  product_name: string;
  images_uploaded?: number;
  errors?: string[];
}

interface ImportResponse {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: ImportResult[];
}

export function BulkImportProducts({ onImportComplete }: { onImportComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ImportResponse>('/admin/products/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to import products');
      console.error('Import error:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template content
    const template = `name,sku,price,category_slug,stock,brand,description,short_description,compare_at_price,is_featured,image_url_1,image_url_2
iPhone 16 Pro,IPHONE-16-PRO,8999,iphone,50,Apple,"Latest iPhone with A18 Pro chip","Premium smartphone",9999,true,https://example.com/iphone16-front.jpg,https://example.com/iphone16-back.jpg
Samsung Galaxy S25,SAMSUNG-S25,7999,android,30,Samsung,"Latest Samsung flagship","Powerful Android device",8499,false,https://example.com/s25-front.jpg,
AirPods Pro 3,AIRPODS-PRO-3,2499,accessories,100,Apple,"Premium wireless earbuds","Active noise cancellation",,false,https://example.com/airpods.jpg,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black-50 border border-gold-600/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Bulk Import Products</h2>
            <p className="text-gray-400 text-sm">
              Upload a CSV or Excel file to import multiple products with images at once
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 text-gold-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* File Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive
              ? 'border-gold-600 bg-gold-600/10'
              : 'border-gold-600/30 bg-black-100 hover:border-gold-600/50'
          )}
        >
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="space-y-2">
                {file.name.endsWith('.csv') ? (
                  <FileText className="w-12 h-12 mx-auto text-gold-600" />
                ) : (
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-gold-600" />
                )}
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gold-600" />
                <div>
                  <p className="text-white font-medium mb-1">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-gray-400 text-sm">
                    Supports CSV and Excel files (.csv, .xlsx, .xls)
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Import Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || uploading}
          className={cn(
            'w-full mt-4 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
            !file || uploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gold-600 hover:bg-gold-700 text-white'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Importing products...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Import Products
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-black-50 border border-gold-600/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Import Results</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black-100 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{result.summary.total}</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-400">{result.summary.successful}</p>
            </div>
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{result.summary.failed}</p>
            </div>
          </div>

          {result.summary.failed > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <p className="text-red-400 font-medium text-sm">Errors:</p>
              {result.results
                .filter((r) => !r.success)
                .map((r, idx) => (
                  <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded p-3">
                    <p className="text-red-300 text-sm font-medium">
                      Row {r.row}: {r.product_name}
                    </p>
                    {r.errors && (
                      <ul className="mt-1 space-y-1">
                        {r.errors.map((err, errIdx) => (
                          <li key={errIdx} className="text-red-400 text-xs">
                            • {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          )}

          {result.summary.successful > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              <p className="text-green-400 font-medium text-sm">Successfully imported:</p>
              <div className="space-y-1">
                {result.results
                  .filter((r) => r.success)
                  .map((r, idx) => (
                    <div key={idx} className="bg-green-500/10 border border-green-500/30 rounded p-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-green-300 text-sm">
                        {r.product_name}
                        {r.images_uploaded !== undefined && r.images_uploaded > 0 && (
                          <span className="text-green-400 ml-2">
                            ({r.images_uploaded} image{r.images_uploaded > 1 ? 's' : ''})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
