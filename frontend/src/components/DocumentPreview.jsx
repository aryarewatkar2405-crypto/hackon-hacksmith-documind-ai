function DocumentPreview({ document }) {
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const fileName = document?.document_name || ''
  const lowerFileName = fileName.toLowerCase()
  const fileUrl = `${backendBaseUrl}/uploads/${encodeURIComponent(fileName)}`

  const isImage =
    lowerFileName.endsWith('.jpg') ||
    lowerFileName.endsWith('.jpeg') ||
    lowerFileName.endsWith('.png')

  const isPdf = lowerFileName.endsWith('.pdf')

  const fields = Object.entries(document?.fields || {}).filter(([, value]) => value)

  if (!document) {
    return null
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Document Preview</h2>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p>
          <span className="font-semibold">Document Name:</span> {document.document_name}
        </p>
        <p>
          <span className="font-semibold">Document Type:</span> {document.document_type}
        </p>
        <p>
          <span className="font-semibold">Extracted Fields:</span>{' '}
          {fields.length === 0
            ? '-'
            : fields.map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`).join(' | ')}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
        {isImage && (
          <img
            src={fileUrl}
            alt={document.document_name}
            className="max-h-[520px] w-full rounded object-contain"
          />
        )}

        {isPdf && (
          <iframe
            src={fileUrl}
            title={document.document_name}
            className="h-[520px] w-full rounded bg-white"
          />
        )}

        {!isImage && !isPdf && (
          <p className="text-sm text-slate-600">Preview not supported for this file type.</p>
        )}
      </div>
    </section>
  )
}

export default DocumentPreview