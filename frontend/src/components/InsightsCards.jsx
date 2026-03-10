import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'

function InsightsCards({ documents }) {
  const navigate = useNavigate()

  const getCreatedAtTime = (doc) => {
    if (doc?.created_at?.toDate) {
      return doc.created_at.toDate().getTime()
    }

    if (doc?.created_at instanceof Date) {
      return doc.created_at.getTime()
    }

    return 0
  }

  const typeDistributionMap = documents.reduce((accumulator, doc) => {
    const type = doc.document_type || 'general_document'
    accumulator[type] = (accumulator[type] || 0) + 1
    return accumulator
  }, {})

  const typeDistribution = Object.entries(typeDistributionMap).map(([type, count]) => ({
    type: type.replaceAll('_', ' '),
    count,
  }))

  const topType = Object.entries(typeDistributionMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  const entityCounts = documents.reduce((accumulator, doc) => {
    const fields = doc.fields || {}
    const entity = fields.vendor || fields.store_name || fields.party_a || fields.name || ''

    if (entity) {
      accumulator[entity] = (accumulator[entity] || 0) + 1
    }

    return accumulator
  }, {})

  const topEntity = Object.entries(entityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  const latestDocument = [...documents].sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a))[0]

  const cards = [
    { title: 'Total Documents', value: documents.length, icon: '📄' },
    { title: 'Most Common Type', value: topType.replaceAll('_', ' '), icon: '📊' },
    { title: 'Most Frequent Vendor', value: topEntity, icon: '🏢' },
    {
      title: 'Uploaded Documents',
      value: 'Open folders',
      icon: '🗂️',
      onClick: () => navigate('/documents#folders-section'),
    },
    { title: 'Latest Uploaded Document', value: latestDocument?.document_name || '-', icon: '🕒' },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 ease-in-out">
      <h2 className="text-xl font-semibold text-slate-900">Document Insights</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md ${
              card.onClick ? 'cursor-pointer' : ''
            }`}
            onClick={card.onClick}
            role={card.onClick ? 'button' : undefined}
            tabIndex={card.onClick ? 0 : undefined}
            onKeyDown={(event) => {
              if (!card.onClick) {
                return
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                card.onClick()
              }
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-slate-500">{card.title}</p>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[1.6rem] shadow-sm">
                {card.icon}
              </span>
            </div>
            <p className="mt-2 truncate text-lg font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition duration-200 ease-in-out">
        <p className="text-sm font-medium text-slate-700">Document Type Distribution</p>
        <div className="mt-3 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="type" tick={{ fill: '#334155', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default InsightsCards