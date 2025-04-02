import React from 'react'
import ReactDOM from 'react-dom/client'
// Remove App import, it's now handled by the index route
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Import Layout and Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
// Consider adding a NotFoundPage later

const queryClient = new QueryClient()

// Define the router configuration
const router = createBrowserRouter([
  {
    // Routes that use the MainLayout
    path: "/",
    element: <MainLayout />, 
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true, 
        element: <HomePage />, // Render HomePage at "/"
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      // Add other main app routes here (e.g., settings, specific song/blog pages)
    ],
  },
  {
    // Standalone routes (no MainLayout)
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  // Add NotFound route later
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} /> 
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
