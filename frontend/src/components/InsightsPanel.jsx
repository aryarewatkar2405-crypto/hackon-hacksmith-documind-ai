import { useState } from 'react'

function InsightsPanel({ documents }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask a question to get quick insights from uploaded documents.')

  const parseAmount = (doc) => {
    const rawAmount = doc?.fields?.amount ?? ''
    const numeric = String(rawAmount)
      .replace(/[^0-9.]/g, '')
      .trim()

    const parsed = Number(numeric)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const getVendorName = (doc) => doc?.fields?.vendor || doc?.fields?.store_name || 'Unknown vendor'

  const getLatestDocumentName = () => {
    const sortedDocs = [...documents].sort((left, right) => {
      const leftTime = left?.created_at?.toDate
        ? left.created_at.toDate().getTime()
        : left?.created_at instanceof Date
          ? left.created_at.getTime()
          : 0
      const rightTime = right?.created_at?.toDate
        ? right.created_at.toDate().getTime()
        : right?.created_at instanceof Date
          ? right.created_at.getTime()
          : 0
      return rightTime - leftTime
    })

    return sortedDocs[0]?.document_name || '-'
  }

  const handleAnalyze = () => {
    const normalizedQuestion = question.toLowerCase().trim()

    if (!normalizedQuestion) {
      setAnswer('Please enter a question first.')
      return
    }

    if (documents.length === 0) {
      setAnswer('No document data available yet. Upload a document first.')
      return
    }

    // Rule 1: Highest invoice question.
    if (normalizedQuestion.includes('highest') && normalizedQuestion.includes('invoice')) {
      const highestDoc = documents.reduce((maxDoc, currentDoc) => {
        return parseAmount(currentDoc) > parseAmount(maxDoc) ? currentDoc : maxDoc
      }, documents[0])

      setAnswer(`${getVendorName(highestDoc)} has the highest invoice of ₹${parseAmount(highestDoc)}.`)
      return
    }

    // Rule 2: Total spending question.
    if (normalizedQuestion.includes('total') && normalizedQuestion.includes('spending')) {
      const total = documents.reduce((sum, doc) => sum + parseAmount(doc), 0)
      setAnswer(`Total spending is ₹${total}.`)
      return
    }

    // Rule 3: Invoice count question.
    if (
      (normalizedQuestion.includes('how many') && (normalizedQuestion.includes('invoice') || normalizedQuestion.includes('document'))) ||
      normalizedQuestion.includes('number of invoices')
    ) {
      setAnswer(`There are ${documents.length} documents uploaded.`)
      return
    }

    // Rule 4: Latest document question.
    if (
      normalizedQuestion.includes('latest') ||
      normalizedQuestion.includes('most recent') ||
      normalizedQuestion.includes('last uploaded')
    ) {
      setAnswer(`Latest uploaded document is ${getLatestDocumentName()}.`)
      return
    }

    setAnswer('Try asking: highest invoice, total spending, how many documents are uploaded, or latest document uploaded.')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Ask Questions</h2>
      <p className="mt-1 text-sm text-slate-600">Ask simple questions about uploaded documents</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Which vendor has the highest invoice?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAnalyze}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Analyze
        </button>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{answer}</div>
    </section>
  )
}

export default InsightsPanel