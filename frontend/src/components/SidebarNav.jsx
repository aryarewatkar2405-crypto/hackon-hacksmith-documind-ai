import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: '🏠', to: '/' },
  { label: 'Upload Documents', icon: '📤', to: '/' },
  { label: 'Document Analytics', icon: '📊', to: '/' },
  { label: 'Uploaded Documents', icon: '🗂️', to: '/documents' },
  { label: 'Settings', icon: '⚙️', to: null },
]

function SidebarNav() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-5 md:block">
      <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-white shadow-sm transition duration-200 ease-in-out">
        <p className="text-xs uppercase tracking-wide text-indigo-100">Workspace</p>
        <h1 className="mt-1 text-xl font-semibold">DocuMind AI</h1>
      </div>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          if (!item.to) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 ease-in-out hover:bg-indigo-50"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className="block"
            >
              {({ isActive }) => (
                <span
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ease-in-out ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent'}`} />
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default SidebarNav
