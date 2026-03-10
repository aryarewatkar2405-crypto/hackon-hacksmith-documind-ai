import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import InsightsPanel from '../components/InsightsPanel'
import UploadBox from '../components/UploadBox'
import { db } from '../firebase'

function Dashboard() {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Read existing uploaded documents from Firestore for initial dashboard load.
        const querySnapshot = await getDocs(collection(db, 'documents'))
        const storedDocuments = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            document_name: data.filename || '-',
            vendor: data.vendor || '-',
            invoice_number: data.invoice_number || '-',
            date: data.date || '-',
            amount: data.amount || '-',
          }
        })

        setDocuments(storedDocuments)
      } catch {
        // Keep MVP simple: fail silently and allow fresh uploads to continue.
      }
    }

    fetchDocuments()
  }, [])

  const handleUploadSuccess = async (uploadResult) => {
    const structured = uploadResult.structured_data || {}

    // Build a clean Firestore document from OCR extraction response.
    const firestorePayload = {
      filename: uploadResult.filename || '-',
      vendor: structured.vendor || '-',
      invoice_number: structured.invoice_number || '-',
      date: structured.date || '-',
      amount: structured.total_amount || '-',
      created_at: new Date(),
    }

    // Save extracted document data into Firestore collection: documents.
    await addDoc(collection(db, 'documents'), firestorePayload)

    const nextDocument = {
      document_name: firestorePayload.filename,
      vendor: firestorePayload.vendor,
      invoice_number: firestorePayload.invoice_number,
      date: firestorePayload.date,
      amount: firestorePayload.amount,
    }

    setDocuments((prev) => [nextDocument, ...prev])
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">DocuMind AI Dashboard</h1>
          <p className="mt-2 text-slate-600">Upload invoice images and view extracted data</p>
        </header>

        <UploadBox onUploadSuccess={handleUploadSuccess} />

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Extracted Documents</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-700">
                  <th className="px-4 py-3 font-semibold">Document Name</th>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Invoice Number</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, index) => (
                    <tr key={`${doc.document_name}-${index}`} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-800">{doc.document_name}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.vendor}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.invoice_number}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.date}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <InsightsPanel documents={documents} />
      </div>
    </main>
  )
}

export default Dashboard