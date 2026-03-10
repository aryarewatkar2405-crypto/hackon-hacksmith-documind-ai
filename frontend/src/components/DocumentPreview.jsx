import { useEffect, useMemo, useState } from 'react'

function DocumentPreview({ document }) {
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const fileName = document?.document_name || ''
  const lowerFileName = fileName.toLowerCase()
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const [previewFailed, setPreviewFailed] = useState(false)

  const fallbackUrls = useMemo(() => {
    const encodedFile = encodeURIComponent(fileName)
    const normalizedBase = backendBaseUrl.replace(/\/$/, '')
    const hostAlternates = new Set([
      normalizedBase,
      normalizedBase.includes('localhost') ? normalizedBase.replace('localhost', '127.0.0.1') : normalizedBase,
      normalizedBase.includes('127.0.0.1') ? normalizedBase.replace('127.0.0.1', 'localhost') : normalizedBase,
      'http://127.0.0.1:8000',
      'http://localhost:8000',
    ])

    if (document?.preview_url) {
      hostAlternates.add(document.preview_url.replace(/\/uploads\/.*/, ''))
    }

    return [...hostAlternates].map((base) => `${base.replace(/\/$/, '')}/uploads/${encodedFile}`)
  }, [backendBaseUrl, document?.preview_url, fileName])

  const fileUrl = document?.preview_url || fallbackUrls[fallbackIndex] || `${backendBaseUrl}/uploads/${encodeURIComponent(fileName)}`

  const isImage =
    lowerFileName.endsWith('.jpg') ||
    lowerFileName.endsWith('.jpeg') ||
    lowerFileName.endsWith('.png')

  const isPdf = lowerFileName.endsWith('.pdf')

  const fields = Object.entries(document?.fields || {}).filter(([, value]) => value)

  useEffect(() => {
    setFallbackIndex(0)
    setPreviewFailed(false)
  }, [document?.id, document?.document_name, document?.preview_url])

  const handlePreviewError = () => {
    if (fallbackIndex < fallbackUrls.length - 1) {
      setFallbackIndex((prev) => prev + 1)
      return
    }

    setPreviewFailed(true)
  }

  const jumpToUpload = () => {
    if (window.location.pathname !== '/') {
      window.location.href = '/#upload-section'
      return
    }

    window.history.replaceState(null, '', '/#upload-section')
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const typeBadgeClass = (type) => {
    const normalizedType = (type || '').toLowerCase()

    if (normalizedType === 'invoice') {
      return 'bg-blue-100 text-blue-700'
    }

    if (normalizedType === 'receipt') {
      return 'bg-emerald-100 text-emerald-700'
    }

    if (normalizedType === 'contract') {
      return 'bg-violet-100 text-violet-700'
    }

    if (normalizedType === 'id_card' || normalizedType === 'id card') {
      return 'bg-orange-100 text-orange-700'
    }

    return 'bg-slate-100 text-slate-700'
  }

  if (!document) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 ease-in-out">
        <h2 className="text-xl font-semibold text-slate-900">Document Preview</h2>
        <p className="mt-3 text-sm text-slate-600">Select a document from the table to preview it here.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 ease-in-out">
      <h2 className="text-xl font-semibold text-slate-900">Document Preview</h2>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-semibold">Document Name:</span> {document.document_name}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Document Type:</span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold transition duration-200 ease-in-out ${typeBadgeClass(document.document_type)}`}
          >
            {(document.document_type || 'general_document').replaceAll('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extracted Fields</p>
        {fields.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No extracted fields available.</p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {fields.map(([key, value]) => (
              <div key={key} className="rounded-md bg-white p-2 text-sm">
                <p className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</p>
                <p className="mt-1 font-medium text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
        {isImage && !previewFailed && (
          <img
            src={fileUrl}
            alt={document.document_name}
            className="max-h-[520px] w-full rounded object-contain"
            onError={handlePreviewError}
          />
        )}

        {isPdf && !previewFailed && (
          <iframe
            src={fileUrl}
            title={document.document_name}
            className="h-[520px] w-full rounded bg-white"
            onError={handlePreviewError}
          />
        )}

        {previewFailed && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            <p>Preview file is not available on the server.</p>
            <p className="mt-1">Please re-upload this document to restore preview.</p>
            <button
              type="button"
              onClick={jumpToUpload}
              className="mt-3 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition duration-200 ease-in-out hover:bg-amber-200"
            >
              Re-upload now
            </button>
          </div>
        )}

        {!isImage && !isPdf && (
          <p className="text-sm text-slate-600">Preview not supported for this file type.</p>
        )}
      </div>
    </section>
  )
}

export default DocumentPreview