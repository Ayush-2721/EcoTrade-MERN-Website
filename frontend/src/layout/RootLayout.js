import React from 'react'
import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <main>
        <div className="container">
          <Outlet/>
        </div>
    </main>
  )
}
