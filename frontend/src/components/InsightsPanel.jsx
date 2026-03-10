import { useState } from 'react'

function InsightsPanel({ documents }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask a question to get quick insights from uploaded invoices.')

  const parseAmount = (value) => {
    const numeric = String(value ?? '')
      .replace(/[^0-9.]/g, '')
      .trim()

    const parsed = Number(numeric)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const handleAnalyze = () => {
    const normalizedQuestion = question.toLowerCase().trim()

    if (!normalizedQuestion) {
      setAnswer('Please enter a question first.')
      return
    }

    if (documents.length === 0) {
      setAnswer('No invoice data available yet. Upload a document first.')
      return
    }

    // Rule 1: Highest invoice question.
    if (normalizedQuestion.includes('highest') && normalizedQuestion.includes('invoice')) {
      const highestDoc = documents.reduce((maxDoc, currentDoc) => {
        return parseAmount(currentDoc.amount) > parseAmount(maxDoc.amount) ? currentDoc : maxDoc
      }, documents[0])

      setAnswer(`${highestDoc.vendor || 'Unknown vendor'} has the highest invoice of ₹${parseAmount(highestDoc.amount)}.`)
      return
    }

    // Rule 2: Total spending question.
    if (normalizedQuestion.includes('total') && normalizedQuestion.includes('spending')) {
      const total = documents.reduce((sum, doc) => sum + parseAmount(doc.amount), 0)
      setAnswer(`Total spending is ₹${total}.`)
      return
    }

    // Rule 3: Invoice count question.
    if (
      (normalizedQuestion.includes('how many') && normalizedQuestion.includes('invoice')) ||
      normalizedQuestion.includes('number of invoices')
    ) {
      setAnswer(`There are ${documents.length} invoices uploaded.`)
      return
    }

    setAnswer('Try asking: highest invoice, total spending, or how many invoices are uploaded.')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Document Insights</h2>
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