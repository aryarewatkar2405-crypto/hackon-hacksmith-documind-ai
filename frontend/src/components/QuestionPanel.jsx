import { useState } from 'react'

function QuestionPanel({ documents }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask a question about your uploaded documents.')

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

  const handleAsk = () => {
    const normalized = question.toLowerCase().trim()

    if (!normalized) {
      setAnswer('Please type a question first.')
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Ask Questions</h2>
      <p className="mt-1 text-sm text-slate-600">Get quick answers from document analytics</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Which document has highest amount?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAsk}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ask
        </button>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{answer}</div>
    </section>
  )
}

export default QuestionPanel