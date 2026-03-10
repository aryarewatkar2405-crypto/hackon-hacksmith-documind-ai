import { useEffect, useState } from 'react'
import HealthStatus from '../components/HealthStatus'
import { getBackendHealth } from '../services/healthService'

function HomePage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('unknown')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getBackendHealth()
        setStatus(data.status || 'unknown')
      } catch {
        setError('Unable to connect to backend. Is FastAPI running?')
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">DocuMind AI</h1>
        <p className="mt-2 text-slate-600">Hackathon MVP starter</p>

        <div className="mt-6">
          <HealthStatus loading={loading} status={status} error={error} />
        </div>
      </section>
    </main>
  )
}

export default HomePage