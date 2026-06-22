import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { NewOrderPage } from '../features/orders/NewOrderPage'
import { BacklogPage } from '../features/backlog/BacklogPage'
import { ValidationPage } from '../features/validation/ValidationPage'
import { PlantMapPage } from '../features/plant-map/PlantMapPage'
import { TabletPage } from '../features/tablet/TabletPage'
import { MobilePage } from '../features/mobile/MobilePage'
import { AdminPage } from '../features/admin/AdminPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/orders/new', element: <NewOrderPage /> },
      { path: '/backlog', element: <BacklogPage /> },
      { path: '/validation', element: <ValidationPage /> },
      { path: '/plant-map', element: <PlantMapPage /> },
      { path: '/tablet', element: <TabletPage /> },
      { path: '/mobile', element: <MobilePage /> },
      { path: '/admin', element: <AdminPage /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
