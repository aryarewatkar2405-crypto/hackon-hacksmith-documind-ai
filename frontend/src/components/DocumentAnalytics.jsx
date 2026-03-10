import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function DocumentAnalytics({ refreshSignal = 0 }) {
  const [documents, setDocuments] = useState([])
  const [analytics, setAnalytics] = useState({
    totalDocuments: 0,
    typeDistribution: {},
    mostCommonType: '-',
    mostFrequentEntity: '-',
    totalAmount: 0,
    latestDocument: '-',
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Load all documents from Firestore for global dashboard analytics.
        const snapshot = await getDocs(collection(db, 'documents'))
        const docs = snapshot.docs.map((doc) => doc.data())
        setDocuments(docs)

        const totalDocuments = docs.length

        // Count how many documents belong to each document_type.
        const typeDistribution = docs.reduce((accumulator, doc) => {
          const type = doc.document_type || 'general_document'
          accumulator[type] = (accumulator[type] || 0) + 1
          return accumulator
        }, {})

        const mostCommonTypeRaw =
          Object.entries(typeDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
        const mostCommonType =
          mostCommonTypeRaw === 'general_document'
            ? 'Other'
            : mostCommonTypeRaw.replaceAll('_', ' ')

        // Count vendors/entities from common field keys across document types.
        const entityCounts = docs.reduce((accumulator, doc) => {
          const fields = doc.fields || {}
          const entity = fields.vendor || fields.store_name || fields.party_a || fields.name || ''
          if (entity) {
            accumulator[entity] = (accumulator[entity] || 0) + 1
          }
          return accumulator
        }, {})

        const mostFrequentEntity =
          Object.entries(entityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

        // Sum amount from documents where amount field is present.
        const totalAmount = docs.reduce((sum, doc) => {
          const rawAmount = String(doc?.fields?.amount ?? '')
          const parsedAmount = Number(rawAmount.replace(/[^0-9.]/g, ''))
          return sum + (Number.isFinite(parsedAmount) ? parsedAmount : 0)
        }, 0)

        // Find latest document by created_at timestamp.
        const latestDoc = docs
          .filter((doc) => doc.created_at)
          .sort((a, b) => {
            const left = a.created_at?.toDate ? a.created_at.toDate().getTime() : 0
            const right = b.created_at?.toDate ? b.created_at.toDate().getTime() : 0
            return right - left
          })[0]

        const latestDocument = latestDoc?.filename || '-'

        setAnalytics({
          totalDocuments,
          typeDistribution,
          mostCommonType,
          mostFrequentEntity,
          totalAmount,
          latestDocument,
        })
      } catch {
        // Keep MVP simple: analytics stays with default values on read failures.
      }
    }

    loadAnalytics()
  }, [refreshSignal])

  const formatTypeLabel = (type) => {
    if (type === 'general_document') {
      return 'Other'
    }
    return type.replaceAll('_', ' ')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Document Insights</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Total Documents</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{analytics.totalDocuments}</p>
          <p className="mt-1 text-sm text-slate-600">You have uploaded {documents.length} documents.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Most Common Type</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{analytics.mostCommonType}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Most Frequent Entity</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{analytics.mostFrequentEntity}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase text-slate-500">Total Amount Mentioned</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">₹{analytics.totalAmount}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase text-slate-500">Latest Document</p>
          <p className="mt-1 truncate text-lg font-semibold text-slate-900">{analytics.latestDocument}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs uppercase text-slate-500">Document Type Distribution</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(analytics.typeDistribution).length === 0 ? (
            <p className="text-sm text-slate-600">No distribution data yet.</p>
          ) : (
            Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div key={type} className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                <span className="font-medium capitalize">{formatTypeLabel(type)}</span>: {count}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default DocumentAnalytics