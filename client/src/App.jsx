import './App.css'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './components/AuthContext'

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'

const router = createBrowserRouter([
  {
   path: '/login',
   element: <Login /> 
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/',
    element: <Dashboard />
  }
])

export const localUrl = 'http://localhost:3001/'
export const globalUrl = 'https://rpi4.uno/api/'

function App() {
  return (
    <div>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider> 
    </div>
  )
}

export default App
