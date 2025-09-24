import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  BarChart3,
  Bell, 
  User,
  ChevronDown
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },  
  { 
    name: 'Modules', 
    children: [
      { name: 'Contract Initiation', href: '/contract', icon: FileText },
      { name: 'Calculations', href: '/calculations', icon: Calculator },
      { name: 'Methodology', href: '/methodology', icon: BookOpen },
    ]
  },
  { name: 'Learn IFRS 16', href: '/education' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reports', href: '/reports' },
];

export function Header() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
   <header className="bg-black px-6 py-4">
      <div className="flex items-center justify-between">
        
        {/* Logo + title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">IFRS 16 Leases</h1>
            <p className="text-sm text-gray-400">Professional Lease Management System</p>
          </div>
        </div>

        {/* Navigation + Notifications + User */}
        <div className="flex items-center gap-6">
          
          {/* Navigation links */}
          <nav className="flex items-center gap-4 relative">
            {navigation.map((item) => {
              if (item.children) {
                // Dropdown menu
                return (
                  <div key={item.name} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setOpenDropdown(!openDropdown)}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
                        ${openDropdown ? 'text-blue-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      {item.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${openDropdown ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>

                    {openDropdown && (
                      <div className="absolute top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`
                                flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                ${isActive 
                                  ? 'text-blue-400 bg-gray-800' 
                                  : 'text-gray-300 hover:bg-gray-700'}
                              `}
                              onClick={() => setOpenDropdown(false)}
                            >
                              {child.icon && <child.icon className="w-4 h-4" />}
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    px-2 py-1 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-blue-400 bg-gray-800' 
                      : 'text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Notification */}
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
            <User className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-200">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
