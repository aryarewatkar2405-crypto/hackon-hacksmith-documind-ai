import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc as firestoreDoc, getDocs, orderBy, query } from 'firebase/firestore'
import DocumentPreview from '../components/DocumentPreview'
import InsightsCards from '../components/InsightsCards'
import QuestionPanel from '../components/QuestionPanel'
import SidebarNav from '../components/SidebarNav'
import UploadBox from '../components/UploadBox'
import { db } from '../firebase'

function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)

  const formatFields = (fields = {}) => {
    const entries = Object.entries(fields).filter(([, value]) => value)

    if (entries.length === 0) {
      return '-'
    }

    return entries
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`)
      .join(' | ')
  }

  const typeBadgeConfig = (type) => {
    const normalizedType = (type || '').toLowerCase()

    if (normalizedType === 'invoice') {
      return { label: 'Invoice', icon: '🧾', className: 'bg-blue-100 text-blue-700' }
    }

    if (normalizedType === 'receipt') {
      return { label: 'Receipt', icon: '🛍️', className: 'bg-emerald-100 text-emerald-700' }
    }

    if (normalizedType === 'contract') {
      return { label: 'Contract', icon: '📃', className: 'bg-violet-100 text-violet-700' }
    }

    if (normalizedType === 'id_card' || normalizedType === 'id card') {
      return { label: 'ID Card', icon: '🪪', className: 'bg-orange-100 text-orange-700' }
    }

    return { label: 'General Document', icon: '📄', className: 'bg-slate-100 text-slate-700' }
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

    const tempId = `temp-${Date.now()}`

    const nextDocument = {
      id: tempId,
      document_name: firestorePayload.filename,
      document_type: firestorePayload.document_type,
      fields: firestorePayload.fields,
      created_at: firestorePayload.created_at,
    }

    // Update UI immediately so user sees result without waiting for Firestore.
    setDocuments((prev) => [nextDocument, ...prev])
    setSelectedDocument(nextDocument)

    // Persist in background for MVP responsiveness.
    addDoc(collection(db, 'documents'), firestorePayload)
      .then((ref) => {
        setDocuments((prev) =>
          prev.map((docItem) => (docItem.id === tempId ? { ...docItem, id: ref.id } : docItem)),
        )
      })
      .catch(() => {
        // Ignore persistence failure and keep local dashboard state.
      })

  }

  const handleDeleteDocument = async (documentToDelete, event) => {
    event.stopPropagation()

    const confirmed = window.confirm(`Delete ${documentToDelete.document_name}?`)
    if (!confirmed) {
      return
    }

    if (documentToDelete.id && !String(documentToDelete.id).startsWith('temp-')) {
      try {
        await deleteDoc(firestoreDoc(db, 'documents', documentToDelete.id))
      } catch {
        // Keep MVP simple: continue local removal even if remote delete fails.
      }
    }

    const updatedDocuments = documents.filter((docItem) => docItem.id !== documentToDelete.id)
    setDocuments(updatedDocuments)

    if (selectedDocument?.id === documentToDelete.id) {
      setSelectedDocument(updatedDocuments[0] || null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <SidebarNav />

        <section className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <header className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-5 shadow-sm transition duration-200 ease-in-out md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white md:text-3xl">DocuMind AI</h2>
                  <p className="mt-1 text-sm text-indigo-100 md:text-base">
                    AI-powered document intelligence platform
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/30"
                  >
                    Upload
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                    U
                  </div>
                </div>
              </div>
            </header>

            <section id="upload-section">
              <UploadBox onUploadSuccess={handleUploadSuccess} />
            </section>

            <InsightsCards documents={documents} />

            <QuestionPanel documents={documents} />

            <div className="grid gap-6 xl:grid-cols-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ease-in-out xl:col-span-3">
                <h3 className="text-xl font-semibold text-slate-900">Extracted Documents</h3>

                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left text-slate-700">
                          <th className="px-4 py-3 font-semibold">Document Name</th>
                          <th className="px-4 py-3 font-semibold">Document Type</th>
                          <th className="px-4 py-3 font-semibold">Extracted Fields</th>
                          <th className="px-4 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                              No documents uploaded yet.
                            </td>
                          </tr>
                        ) : (
                          documents.map((doc, index) => (
                            (() => {
                              const typeBadge = typeBadgeConfig(doc.document_type)

                              return (
                                <tr
                                  key={`${doc.document_name}-${index}`}
                                  className={`cursor-pointer border-t border-slate-100 transition duration-200 ease-in-out hover:bg-gray-50 ${
                                    selectedDocument?.document_name === doc.document_name ? 'bg-indigo-50/60' : ''
                                  }`}
                                  onClick={() => setSelectedDocument(doc)}
                                >
                              <td className="px-4 py-3 font-medium text-slate-800">{doc.document_name}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition duration-200 ease-in-out ${typeBadge.className}`}
                                >
                                  <span>{typeBadge.icon}</span>
                                  <span>{typeBadge.label}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{formatFields(doc.fields)}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={(event) => handleDeleteDocument(doc, event)}
                                  className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition duration-200 ease-in-out hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </td>
                                </tr>
                              )
                            })()
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {documents.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    Click any row to open the preview panel.
                  </p>
                )}
              </section>

              <div className="xl:col-span-2">
                <DocumentPreview document={selectedDocument} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard