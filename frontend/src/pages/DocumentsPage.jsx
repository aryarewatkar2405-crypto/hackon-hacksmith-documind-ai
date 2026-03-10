import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useLocation } from 'react-router-dom'
import DocumentPreview from '../components/DocumentPreview'
import SidebarNav from '../components/SidebarNav'
import { db } from '../firebase'

const GROUP_ORDER = ['invoice', 'receipt', 'contract', 'id_card', 'general_document']

const GROUP_LABELS = {
  invoice: 'Invoices',
  receipt: 'Receipts',
  contract: 'Contracts',
  id_card: 'ID Cards',
  general_document: 'General Documents',
}

function DocumentsPage() {
  const location = useLocation()
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docsQuery = query(collection(db, 'documents'), orderBy('created_at', 'desc'))
        const snapshot = await getDocs(docsQuery)
        const loadedDocs = snapshot.docs.map((docItem) => {
          const data = docItem.data()
          return {
            id: docItem.id,
            document_name: data.filename || '-',
            preview_url: data.preview_url || '',
            document_type: data.document_type || 'general_document',
            fields: data.fields || {},
            created_at: data.created_at,
          }
        })

        setDocuments(loadedDocs)
        if (loadedDocs.length > 0) {
          setSelectedDocument(loadedDocs[0])
        }
      } catch {
      }
    }

    fetchDocuments()
  }, [])

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const sectionId = location.hash.replace('#', '')
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  const groupedDocuments = useMemo(() => {
    const groups = GROUP_ORDER.reduce((accumulator, key) => {
      accumulator[key] = []
      return accumulator
    }, {})

    documents.forEach((doc) => {
      const groupKey = GROUP_ORDER.includes(doc.document_type) ? doc.document_type : 'general_document'
      groups[groupKey].push(doc)
    })

    return groups
  }, [documents])

  const formatDate = (createdAt) => {
    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleDateString()
    }

    if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString()
    }

    return '-'
  }

  const typeBadgeClass = (type) => {
    const normalizedType = (type || '').toLowerCase()

    if (normalizedType === 'invoice') return 'bg-blue-100 text-blue-700'
    if (normalizedType === 'receipt') return 'bg-emerald-100 text-emerald-700'
    if (normalizedType === 'contract') return 'bg-violet-100 text-violet-700'
    if (normalizedType === 'id_card') return 'bg-amber-100 text-amber-700'
    return 'bg-slate-100 text-slate-700'
  }

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }))
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <SidebarNav />

        <section className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Uploaded Documents</h2>
              <p className="mt-1 text-sm text-slate-600 md:text-base">
                Browse documents grouped by type and open previews quickly.
              </p>
            </header>

            <div className="grid gap-6 xl:grid-cols-5">
              <section id="folders-section" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
                <h3 className="text-xl font-semibold text-slate-900">Folders</h3>

                <div className="mt-4 space-y-3">
                  {GROUP_ORDER.map((groupKey) => {
                    const groupDocs = groupedDocuments[groupKey] || []
                    const isExpanded = !!expandedGroups[groupKey]

                    return (
                      <div key={groupKey} className="rounded-xl border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => toggleGroup(groupKey)}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-slate-100"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <span>📁</span>
                            <span>{GROUP_LABELS[groupKey]} ({groupDocs.length})</span>
                          </span>
                          <span className="text-xs text-slate-500">{isExpanded ? 'Hide' : 'Show'}</span>
                        </button>

                        {isExpanded && (
                          <div className="space-y-2 border-t border-slate-200 px-3 py-3">
                            {groupDocs.length === 0 ? (
                              <p className="px-2 py-2 text-sm text-slate-500">No documents in this folder.</p>
                            ) : (
                              groupDocs.map((doc) => (
                                <button
                                  key={doc.id}
                                  type="button"
                                  onClick={() => setSelectedDocument(doc)}
                                  className={`flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left transition hover:bg-slate-50 ${
                                    selectedDocument?.id === doc.id ? 'ring-2 ring-indigo-200' : ''
                                  }`}
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">{doc.document_name}</p>
                                    <p className="mt-1 text-xs text-slate-500">Uploaded: {formatDate(doc.created_at)}</p>
                                  </div>

                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeClass(doc.document_type)}`}
                                  >
                                    {doc.document_type.replaceAll('_', ' ')}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
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

export default DocumentsPage
