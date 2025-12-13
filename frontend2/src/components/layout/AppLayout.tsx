import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { Footer } from './Footer'
import ScrollToTop from './ScrollToTop'

export default function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col">
          <TopNav />
          <main className="container mx-auto p-6 max-w-7xl flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
