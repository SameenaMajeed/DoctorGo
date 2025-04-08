import React from 'react'

const SidebarItem: React.FC<{ href: string; icon: JSX.Element; label: string; className?: string }> = ({ href, icon, label, className }) => (
  <a
    href={href}
    className={`flex items-center px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition ${className}`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </a>
);

export default SidebarItem