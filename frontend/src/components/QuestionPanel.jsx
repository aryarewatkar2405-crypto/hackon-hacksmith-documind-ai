import { useMemo, useState } from 'react'

function QuestionPanel({ documents, onSelectDocument }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('Ask a question about your uploaded documents.')
  const [hasSearched, setHasSearched] = useState(false)

  const formatType = (type) => (type || 'general_document').replaceAll('_', ' ')

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

  const parseAmount = (doc) => {
    const raw = String(doc?.fields?.amount ?? '')
    const numeric = Number(raw.replace(/[^0-9.]/g, ''))
    return Number.isFinite(numeric) ? numeric : 0
  }

  const getCreatedAtTime = (doc) => {
    if (doc?.created_at?.toDate) {
      return doc.created_at.toDate().getTime()
    }

    if (doc?.created_at instanceof Date) {
      return doc.created_at.getTime()
    }

    return 0
  }

  const searchResults = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) {
      return []
    }

    return documents.filter((doc) => {
      const filename = String(doc?.document_name ?? '').toLowerCase()
      const documentType = String(doc?.document_type ?? '').replaceAll('_', ' ').toLowerCase()
      const fieldText = Object.values(doc?.fields || {})
        .map((value) => String(value || '').toLowerCase())
        .join(' ')

      return (
        filename.includes(normalized) ||
        documentType.includes(normalized) ||
        fieldText.includes(normalized)
      )
    })
  }, [documents, query])

  const handleQuery = () => {
    const normalized = query.toLowerCase().trim()
    setHasSearched(true)

    if (!normalized) {
      setAnswer('Please type a search keyword or question first.')
      return
    }

    if (documents.length === 0) {
      setAnswer('No documents found. Upload a document first.')
      return
    }

    if (normalized.includes('how many')) {
      setAnswer(`You have uploaded ${documents.length} documents.`)
      return
    }

    if (normalized.includes('most common type')) {
      const typeCounts = documents.reduce((accumulator, doc) => {
        const type = doc.document_type || 'general_document'
        accumulator[type] = (accumulator[type] || 0) + 1
        return accumulator
      }, {})

      const [topType, topCount] = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0] || []
      const typeLabel = (topType || 'other').replaceAll('_', ' ')
      setAnswer(`${typeLabel} appears most frequently (${topCount || 0} documents).`)
      return
    }

    if (normalized.includes('highest amount')) {
      const highestDoc = documents.reduce((maxDoc, currentDoc) => {
        return parseAmount(currentDoc) > parseAmount(maxDoc) ? currentDoc : maxDoc
      }, documents[0])

      setAnswer(
        `${highestDoc.document_name || 'Document'} has the highest amount of ₹${parseAmount(highestDoc)}.`
      )
      return
    }

    if (normalized.includes('latest document')) {
      const latestDoc = [...documents].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a))[0]
      setAnswer(`Latest uploaded document is ${latestDoc?.document_name || '-'}.`)
      return
    }

    setAnswer('Try asking: how many, most common type, highest amount, or latest document.')
  }

  const formatDate = (createdAt) => {
    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleDateString()
    }

    if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString()
    }

    return '-'
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 ease-in-out">
      <h2 className="text-xl font-semibold text-slate-900">Search or Ask About Documents</h2>
      <p className="mt-1 text-sm text-slate-600">Search files instantly or ask analytics questions</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search documents or ask a question (e.g. Find invoices, Search Amazon, Which document has highest amount?)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 transition duration-200 ease-in-out focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleQuery}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-200 ease-in-out hover:bg-slate-800"
        >
          Search / Ask
        </button>
      </div>

      {hasSearched && query.trim() && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matching Documents</p>

          {searchResults.length === 0 ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No results found.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {searchResults.map((doc) => (
                <button
                  key={doc.id || `${doc.document_name}-${doc.created_at}`}
                  type="button"
                  onClick={() => onSelectDocument?.(doc)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition duration-200 ease-in-out hover:bg-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.document_name}</p>
                    <p className="mt-1 text-xs text-slate-500">Uploaded: {formatDate(doc.created_at)}</p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeClass(doc.document_type)}`}
                  >
                    {formatType(doc.document_type)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{answer}</div>
    </section>
  )
}

export default QuestionPanel