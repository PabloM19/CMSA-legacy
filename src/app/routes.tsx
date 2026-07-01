import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppProviders } from './AppProviders'
import { DashboardRedirect, ValidationRedirect } from './RouteRedirects'
import { RootRedirect } from './RootRedirect'
import { AppLayout } from '../components/layout/AppLayout'
import { PlantMapShell } from '../components/layout/PlantMapShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { NewOrderPage } from '../features/orders/NewOrderPage'
import { BacklogPage } from '../features/backlog/BacklogPage'
import { PlantMapPage } from '../features/plant-map/PlantMapPage'
import { TabletPage } from '../features/tablet/TabletPage'
import { MobilePage } from '../features/mobile/MobilePage'
import { AdminPage } from '../features/admin/AdminPage'
import { AlarmsPage } from '../features/alarms/AlarmsPage'
import { ProfilePage } from '../features/profile/ProfilePage'

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/plant-map',
        element: <PlantMapShell />,
        children: [{ index: true, element: <PlantMapPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardRedirect /> },
              { path: '/validation', element: <ValidationRedirect /> },
              { path: '/orders/new', element: <NewOrderPage /> },
              { path: '/backlog', element: <BacklogPage /> },
              { path: '/tablet', element: <TabletPage /> },
              { path: '/mobile', element: <MobilePage /> },
              { path: '/admin', element: <AdminPage /> },
              { path: '/alarms', element: <AlarmsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
      { index: true, element: <RootRedirect /> },
      { path: '*', element: <Navigate to="/plant-map" replace /> },
    ],
  },
])
