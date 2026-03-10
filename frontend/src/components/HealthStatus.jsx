function HealthStatus({ loading, status, error }) {
  if (loading) {
    return <p className="text-slate-600">Checking backend status...</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <p className="text-green-700">
      Backend status: <span className="font-semibold">{status}</span>
    </p>
  )
}

export default HealthStatus