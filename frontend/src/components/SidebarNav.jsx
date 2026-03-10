import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: '🏠', to: '/#dashboard-section', sectionId: 'dashboard-section' },
  { label: 'Upload Documents', icon: '📤', to: '/#upload-section', sectionId: 'upload-section' },
  { label: 'Document Analytics', icon: '📊', to: '/#analytics-section', sectionId: 'analytics-section' },
  { label: 'Uploaded Documents', icon: '🗂️', to: '/documents' },
  { label: 'Settings', icon: '⚙️', to: null },
]

function SidebarNav() {
  const location = useLocation()

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isItemActive = (item, isActiveFromRoute) => {
    if (!item.sectionId) {
      return isActiveFromRoute
    }

    return location.pathname === '/' && location.hash === `#${item.sectionId}`
  }

  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition duration-200 ease-in-out hover:bg-gray-100"
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
              onClick={(event) => {
                if (item.sectionId && location.pathname === '/') {
                  event.preventDefault()
                  window.history.replaceState(null, '', `/#${item.sectionId}`)
                  scrollToSection(item.sectionId)
                }
              }}
            >
              {({ isActive }) => {
                const active = isItemActive(item, isActive)

                return (
                <span
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ease-in-out ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-indigo-500' : 'bg-transparent'}`} />
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              )}}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default SidebarNav
