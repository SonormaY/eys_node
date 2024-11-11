import './App.css'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'

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

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
