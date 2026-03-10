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

    return 'bg-slate-100 text-slate-700'
  }

  if (!document) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Document Preview</h2>
        <p className="mt-3 text-sm text-slate-600">Select a document from the table to preview it here.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Document Preview</h2>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-semibold">Document Name:</span> {document.document_name}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Document Type:</span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeClass(document.document_type)}`}
          >
            {(document.document_type || 'general_document').replaceAll('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
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