import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api/upload'

function UploadBox({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
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
      })

      await onUploadSuccess(response.data)
      setSelectedFile(null)
    } catch {
      setError('Upload failed. Please check backend server and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Upload Invoice</h2>

      <div
        className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className="text-slate-600">Drag and drop invoice image here</p>
        <p className="mt-1 text-sm text-slate-500">or use file picker below</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {selectedFile && (
        <p className="mt-3 text-sm text-slate-600">Selected: {selectedFile.name}</p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default UploadBox