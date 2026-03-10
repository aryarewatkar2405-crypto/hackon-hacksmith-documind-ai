import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api/upload'

function UploadBox({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const isAllowedFile = (file) => {
    if (!file) {
      return false
    }

    const fileName = file.name.toLowerCase()
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf')
    return isImage || isPdf
  }

  const handleFileSelect = (file) => {
    if (!file) {
      return
    }

    if (!isAllowedFile(file)) {
      setError('Please select a JPG, JPEG, PNG, or PDF file.')
      return
    }

    setError('')
    setSelectedFile(file)
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]
    handleFileSelect(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a file first.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 25000,
      })

      onUploadSuccess(response.data)
      setSelectedFile(null)
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Upload timed out. Try a smaller file or retry.')
      } else {
        setError('Upload failed. Please check backend server and try again.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ease-in-out hover:shadow-md">
      <h2 className="text-xl font-semibold text-slate-900">Upload Documents</h2>

      <div
        className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition duration-200 ease-in-out ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
        onClick={() => document.getElementById('documind-file-input')?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className="text-5xl">⭳</p>
        <p className="mt-3 text-base font-medium text-slate-700">
          Drag and drop documents or click to upload
        </p>
        <p className="mt-1 text-sm text-slate-500">Supported formats: PDF, JPG, JPEG, PNG</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="documind-file-input"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleInputChange}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isUploading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />}
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {isUploading && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
          <span>Processing document...</span>
        </div>
      )}

      {selectedFile && (
        <p className="mt-3 text-sm text-slate-600">Selected: {selectedFile.name}</p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default UploadBox