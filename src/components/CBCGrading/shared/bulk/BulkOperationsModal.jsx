/**
 * BulkOperationsModal Component
 * Universal bulk upload/export component for all sections
 * Enhanced with school/branch selector for SUPER_ADMIN
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Download, FileDown, AlertCircle, CheckCircle, Loader, Building2, MapPin } from 'lucide-react';

const BulkOperationsModal = ({ 
  isOpen, 
  onClose, 
  title,
  entityType, // 'learners', 'teachers', 'parents'
  onUploadComplete,
  userRole // Pass user role to determine if SUPER_ADMIN
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // School/Branch Selection State
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loadingSchools, setLoadingSchools] = useState(false);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const needsBranch = entityType === 'learners'; // Only learners need branch

  // Fetch schools when modal opens for SUPER_ADMIN
  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      fetchSchools();
    }
  }, [isOpen, isSuperAdmin]);

  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const response = await fetch('http://localhost:5000/api/schools', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Handle different response formats
        // API returns {data: [...], count: n} format
        const schoolsArray = Array.isArray(result) ? result : (result.data || result.schools || []);
        setSchools(schoolsArray);
        
        // Auto-select if only one school
        if (schoolsArray.length === 1) {
          setSelectedSchool(schoolsArray[0].id);
          // Auto-select if only one branch
          if (schoolsArray[0].branches?.length === 1) {
            setSelectedBranch(schoolsArray[0].branches[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]); // Set empty array on error
    } finally {
      setLoadingSchools(false);
    }
  };

  if (!isOpen) return null;

  const selectedSchoolData = Array.isArray(schools) ? schools.find(s => s.id === selectedSchool) : null;
  const availableBranches = selectedSchoolData?.branches || [];

  const canUpload = () => {
    if (!file) return false;
    if (isSuperAdmin) {
      if (!selectedSchool) return false;
      if (needsBranch && !selectedBranch) return false;
    }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadResult(null);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!canUpload()) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add school and branch for SUPER_ADMIN
      if (isSuperAdmin) {
        formData.append('schoolId', selectedSchool);
        if (needsBranch && selectedBranch) {
          formData.append('branchId', selectedBranch);
        }
      }

      const response = await fetch(`http://localhost:5000/api/bulk/${entityType}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        if (result.summary.created > 0 && onUploadComplete) {
          onUploadComplete();
        }
      } else {
        setUploadResult({
          success: false,
          error: result.error || result.message || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: typeof error === 'string' ? error : error?.message || 'Network error. Please check your connection and try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bulk/${entityType}/template`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download template');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let url = `http://localhost:5000/api/bulk/${entityType}/export`;
      
      // Add query params for SUPER_ADMIN
      if (isSuperAdmin && selectedSchool) {
        const params = new URLSearchParams({ schoolId: selectedSchool });
        if (needsBranch && selectedBranch) {
          params.append('branchId', selectedBranch);
        }
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${entityType}_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-blue-100 text-sm mt-1">Import and export data in bulk using CSV files</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* School/Branch Selector for SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={20} className="text-yellow-700" />
                <h3 className="font-semibold text-yellow-900">Select Target Location</h3>
              </div>
              
              {loadingSchools ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader size={16} className="animate-spin" />
                  <span>Loading schools...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* School Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSchool}
                      onChange={(e) => {
                        setSelectedSchool(e.target.value);
                        setSelectedBranch(''); // Reset branch when school changes
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Select School --</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Selector - Only for learners */}
                  {needsBranch && selectedSchool && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select Branch --</option>
                        {availableBranches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Selection Summary */}
                  {selectedSchool && (
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                      <strong>Selected:</strong> {selectedSchoolData?.name}
                      {needsBranch && selectedBranch && (
                        <> → {availableBranches.find(b => b.id === selectedBranch)?.name}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <FileDown size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-700">Download CSV Template</span>
            </button>

            <button
              onClick={handleExport}
              disabled={exporting || (isSuperAdmin && !selectedSchool)}
              className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span className="font-semibold">Export Current Data</span>
                </>
              )}
            </button>
          </div>

          {/* Warning if school not selected */}
          {isSuperAdmin && !selectedSchool && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Please select a school{needsBranch ? ' and branch' : ''}</strong> before uploading or exporting data.
              </p>
            </div>
          )}

          {/* Upload Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-blue-600" />
              Upload CSV File
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              } ${!canUpload() && file ? 'opacity-50' : ''}`}
            >
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={24} />
                    <span className="font-semibold">{file.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={!canUpload() || uploading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      title={!canUpload() && isSuperAdmin ? 'Please select school and branch first' : ''}
                    >
                      {uploading ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetUpload}
                      disabled={uploading}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload size={48} className="mx-auto text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                  <label className="inline-block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer inline-block">
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported format: CSV (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload Results */}
            {uploadResult && (
              <div className={`mt-6 p-4 rounded-lg border-2 ${
                uploadResult.success 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {uploadResult.success ? (
                    <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">
                      {uploadResult.success ? 'Upload Complete!' : 'Upload Failed'}
                    </h4>
                    
                    {uploadResult.success && uploadResult.summary && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <span className="ml-2 font-semibold">{uploadResult.summary.total}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 font-semibold text-green-600">{uploadResult.summary.created}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Failed:</span>
                            <span className="ml-2 font-semibold text-red-600">{uploadResult.summary.failed}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Validation Errors:</span>
                            <span className="ml-2 font-semibold text-orange-600">{uploadResult.summary.validationErrors}</span>
                          </div>
                        </div>

                        {/* Show errors if any */}
                        {uploadResult.details && (uploadResult.details.failed.length > 0 || uploadResult.details.validationErrors.length > 0) && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700">
                              View Errors ({uploadResult.details.failed.length + uploadResult.details.validationErrors.length})
                            </summary>
                            <div className="mt-2 max-h-60 overflow-y-auto bg-white p-3 rounded border">
                              {uploadResult.details.failed.map((err, idx) => (
                                <div key={idx} className="text-sm py-1 border-b last:border-b-0">
                                  <span className="text-gray-500">Line {err.line}:</span>
                                  <span className="ml-2 text-red-600">{err.reason}</span>
                                  {err.name && <span className="ml-2 text-gray-600">({err.name})</span>}
                                </div>
                              ))}
                              {uploadResult.details.validationErrors.map((err, idx) => (
                                <div key={idx} className="text-sm py-1 border-b last:border-b-0">
                                  <span className="text-gray-500">Line {err.line}:</span>
                                  <span className="ml-2 text-orange-600">
                                    {typeof err.error === 'string' 
                                      ? err.error 
                                      : Array.isArray(err.error)
                                        ? err.error.map(e => e.message || 'Validation error').join(', ')
                                        : 'Validation error'
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}

                    {uploadResult.error && (
                      <p className="text-red-600">
                        {typeof uploadResult.error === 'string' 
                          ? uploadResult.error 
                          : uploadResult.error?.message || 'An error occurred during upload'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              {isSuperAdmin && <li className="font-semibold text-yellow-700">Select the target school{needsBranch ? ' and branch' : ''} first</li>}
              <li>Download the CSV template to see the required format</li>
              <li>Fill in your data following the template structure</li>
              <li>Save the file and upload it using the drag-and-drop zone</li>
              <li>Review the upload results for any errors</li>
              <li>Use Export to download current data for backup or editing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsModal;
