import { RouterProvider, createBrowserRouter, Outlet } from 'react-router'
import Register from './features/auth/pages/Register.jsx'
import Login from './features/auth/pages/Login.jsx'
import Protected from './features/auth/components/Protected.jsx'
import Home from './features/interview/pages/Home.jsx'
import Interview from './features/interview/pages/Interview.jsx'
import { AuthProvider } from './features/auth/auth.context.jsx'
import { InterviewProvider } from './features/interview/Interview.context.jsx'

const ContextLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

const InterviewLayout = () => {
  return (
    <InterviewProvider>
      <Outlet />
    </InterviewProvider>
  )
}

const AppRoutes = () => {
  const routes = [
    {
      element: <ContextLayout />,
      children: [
        {
          path: '/register',
          element: <Register/>
        },
        {
          path: '/login',
          element: <Login/>
        },
        {
          element: <InterviewLayout />,
          children: [
            {
              path: '/',
              element: <Protected><Home/></Protected>
            },
            {
              path: '/interview/:interviewId',
              element: <Protected><Interview/></Protected>
            }
          ]
        }
      ]
    }
  ]
  const router = createBrowserRouter(routes)
  return <RouterProvider router={router} />
}

const App = () => {
  return <AppRoutes />
}

export default App
