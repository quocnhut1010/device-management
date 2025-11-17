import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <main className="container mx-auto p-6 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
