import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import DocumentAnalytics from '../components/DocumentAnalytics'
import DocumentPreview from '../components/DocumentPreview'
import InsightsPanel from '../components/InsightsPanel'
import UploadBox from '../components/UploadBox'
import { db } from '../firebase'

function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [analyticsRefreshSignal, setAnalyticsRefreshSignal] = useState(0)

  const formatFields = (fields = {}) => {
    const entries = Object.entries(fields).filter(([, value]) => value)

    if (entries.length === 0) {
      return '-'
    }

    return entries
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`)
      .join(' | ')
  }

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Read existing uploaded documents from Firestore for initial dashboard load.
        const docsQuery = query(collection(db, 'documents'), orderBy('created_at', 'desc'))
        const querySnapshot = await getDocs(docsQuery)
        const storedDocuments = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            document_name: data.filename || '-',
            document_type: data.document_type || 'general_document',
            fields: data.fields || {},
            created_at: data.created_at,
          }
        })

        setDocuments(storedDocuments)
        if (storedDocuments.length > 0) {
          setSelectedDocument(storedDocuments[0])
        }
      } catch {
        // Keep MVP simple: fail silently and allow fresh uploads to continue.
      }
    }

    fetchDocuments()
  }, [])

  const handleUploadSuccess = (uploadResult) => {
    // Build Firestore payload with generic structure for multiple document types.
    const firestorePayload = {
      filename: uploadResult.filename || '-',
      document_type: uploadResult.document_type || 'general_document',
      fields: uploadResult.fields || {},
      created_at: new Date(),
    }

    const nextDocument = {
      document_name: firestorePayload.filename,
      document_type: firestorePayload.document_type,
      fields: firestorePayload.fields,
      created_at: firestorePayload.created_at,
    }

    // Update UI immediately so user sees result without waiting for Firestore.
    setDocuments((prev) => [nextDocument, ...prev])
    setSelectedDocument(nextDocument)

    // Persist in background for MVP responsiveness.
    addDoc(collection(db, 'documents'), firestorePayload).catch(() => {
      // Ignore persistence failure and keep local dashboard state.
    })

    // Trigger analytics refetch so insights update after every new upload.
    setAnalyticsRefreshSignal((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">DocuMind AI Dashboard</h1>
          <p className="mt-2 text-slate-600">Upload document images and view extracted data</p>
        </header>

        <UploadBox onUploadSuccess={handleUploadSuccess} />

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Extracted Documents</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Document Type</th>
                  <th className="px-4 py-3 font-semibold">Extracted Fields</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, index) => (
                    <tr
                      key={`${doc.document_name}-${index}`}
                      className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                        selectedDocument?.document_name === doc.document_name ? 'bg-slate-50' : ''
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <td className="px-4 py-3 text-slate-800">{doc.document_name}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.document_type}</td>
                      <td className="px-4 py-3 text-slate-700">{formatFields(doc.fields)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {documents.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">Click a row to preview the selected document.</p>
          )}
        </section>

        <DocumentAnalytics refreshSignal={analyticsRefreshSignal} />

        <DocumentPreview document={selectedDocument} />

        <InsightsPanel documents={documents} />
      </div>
    </main>
  )
}

export default Dashboard