import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Dashboard.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0Rhc2hib2FyZC5wbmciLCJpYXQiOjE3NjQzNTEzNDEsImV4cCI6MTkyMjAzMTM0MX0.ywMPNTb4AL54BmRGvi7zoGy2X6tTZc-WMw888sraxWw' },
    { name: 'Patients', href: '/patients', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Patients.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL1BhdGllbnRzLnBuZyIsImlhdCI6MTc2NDM1MTQ5MiwiZXhwIjoxOTIyMDMxNDkyfQ.BSNJyltA30aesZW-2tTdV0BVzPT58I3aXHQLuCrz834' },
    { name: 'Registration', href: '/registration', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Registration.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL1JlZ2lzdHJhdGlvbi5wbmciLCJpYXQiOjE3NjQzNTE1MzEsImV4cCI6MTkyMjAzMTUzMX0.ml6EauuoJUv0Eb2QR7EXy6u2M_RRaH5Oo5p5YvY4mQk' },
    { name: 'Cancellations', href: '/cancellation-refunds', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/icon-cancel.gif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL2ljb24tY2FuY2VsLmdpZiIsImlhdCI6MTc2NDM1MzYxMCwiZXhwIjoxOTIyMDMzNjEwfQ.wsuL1-OIVx4epZbmSmlKC4zD7Dj9oAXIjUIUm7WB45A' },
    { name: 'Injections', href: '/injections', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Injection.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0luamVjdGlvbi5wbmciLCJpYXQiOjE3NjQzNTE1NzksImV4cCI6MTkyMjAzMTU3OX0.XsKYXzoW7QLwITuiNgB0Ci__BDyArO4i_qphG38IFc0' },
    { name: 'Vaccinations', href: '/vaccinations', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/vaccine.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL3ZhY2NpbmUucG5nIiwiaWF0IjoxNzY0MzUxNjE3LCJleHAiOjE5MjIwMzE2MTd9.8PpN0nknFHRbukWa29oTArdcK_Knx4QAh3ZGTHBxreo' },
    { name: 'N/B Babies', href: '/newborn-vaccinations', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/New-born-vaccine.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL05ldy1ib3JuLXZhY2NpbmUucG5nIiwiaWF0IjoxNzY0MzUxNjM4LCJleHAiOjE5MjIwMzE2Mzh9.wFTWmQVCawo_p16-RoAO_vNmWccOAKff43ayKuFMDTE' },
    { name: 'Dermatology', href: '/dermatology', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Dermatology.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0Rlcm1hdG9sb2d5LnBuZyIsImlhdCI6MTc2NDM1MjAwNiwiZXhwIjoxOTIyMDMyMDA2fQ.yXt-5fozyvCDBi0J_83OpR_2gD-57U_HRsXQuvCw6zA' },
    { name: 'Discharge Bills', href: '/discharge-bills', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Discharge-bills.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0Rpc2NoYXJnZS1iaWxscy5wbmciLCJpYXQiOjE3NjQzNTIwODAsImV4cCI6MTkyMjAzMjA4MH0.Ew4Yt54z-ndrJKKVFTkYnroxLn3tVjN8_L0dORsH_fY' },
    { name: 'Discharge Patients', href: '/discharge-patients', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/discharge.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL2Rpc2NoYXJnZS5wbmciLCJpYXQiOjE3NjQzNTIxMTQsImV4cCI6MTkyMjAzMjExNH0.Rq7rZdBHxeYif1hahdKnDVk3n0ZObd75GAf4nVKUng0' },
    { name: 'Billing', href: '/billing', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Billing.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0JpbGxpbmcucG5nIiwiaWF0IjoxNzY0MzUyMTU2LCJleHAiOjE5MjIwMzIxNTZ9.pIo0FkHpYk8YyJfnDTU6ahfnFN2t-4EXGhX6fXnf50E' },
    { name: 'Doctors', href: '/doctors', iconUrl: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/HMS-icons/Doctors.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvSE1TLWljb25zL0RvY3RvcnMuc3ZnIiwiaWF0IjoxNzY0MzUyMTg1LCJleHAiOjE5MjIwMzIxODV9.Og0WxqYPsuNoShWni5YOlfrHu4Amiw1qCt0zFUlXnLw' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 print:min-h-0 print:bg-white print:m-0 print:p-0">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden print:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 flex items-center justify-center">
                    <img
                      src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
                      alt="Aayush Hospital Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#7c3b92' }}>AAYUSH HMS</span>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      style={{ color: isActive ? '' : '#121827' }}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <img src={item.iconUrl} alt={item.name} className="mr-3 h-5 w-5 object-contain" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 print:hidden ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          {/* Logo Section */}
          <div className="flex-shrink-0 pt-5 pb-3">
            <div className={`flex items-center px-4 ${
              sidebarCollapsed ? 'justify-center' : 'space-x-2'
            }`}>
              <div className={`flex items-center justify-center transition-all duration-300 ${
                sidebarCollapsed ? 'h-10 w-10' : 'h-9 w-9'
              }`}>
                <img
                  src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
                  alt="Aayush Hospital Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              {!sidebarCollapsed && (
                <span className="text-base font-semibold transition-opacity duration-300" style={{ color: '#7c3b92' }}>AAYUSH HMS</span>
              )}
            </div>
            {/* Toggle Button */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 overflow-y-auto px-2 pb-4 ${
            sidebarCollapsed ? 'space-y-2' : 'space-y-0.5'
          }`}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  } ${
                    sidebarCollapsed
                      ? 'justify-center py-3 px-2'
                      : 'px-3 py-2'
                  }`}
                  style={{ color: isActive ? '' : '#121827' }}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <img
                    src={item.iconUrl}
                    alt={item.name}
                    className={`object-contain transition-all duration-200 ${
                      sidebarCollapsed ? 'h-7 w-7' : 'h-6 w-6 mr-3'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium transition-opacity duration-200">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 print:pl-0 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200 print:hidden">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Top navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex items-center">
                <div className="flex-shrink-0 lg:hidden">
                  <div className="flex items-center space-x-2">
                    <div className="h-9 w-9 flex items-center justify-center">
                      <img
                        src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
                        alt="Aayush Hospital Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-base font-semibold" style={{ color: '#7c3b92' }}>AAYUSH HMS</span>
                  </div>
                </div>
                <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-8">
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.username}</p>
                          <p className="text-xs text-purple-600 capitalize mt-1">{user?.role}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;