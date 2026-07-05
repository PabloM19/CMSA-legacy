import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { DashboardRedirect, ValidationRedirect } from './RouteRedirects'
import { RootRedirect } from './RootRedirect'
import { AppLayout } from '../components/layout/AppLayout'
import { PlantMapShell } from '../components/layout/PlantMapShell'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { NewOrderPage } from '../features/orders/NewOrderPage'
import { DailyOrdersPage } from '../features/backlog/DailyOrdersPage'
import { ProductionOrdersPage } from '../features/backlog/ProductionOrdersPage'
import { PlantMapPage } from '../features/plant-map/PlantMapPage'
import { TabletPage } from '../features/tablet/TabletPage'
import { MobilePage } from '../features/mobile/MobilePage'
import { AdminPage } from '../features/admin/AdminPage'
import { AlarmsPage } from '../features/alarms/AlarmsPage'
import { ReferencesPage } from '../features/references/ReferencesPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { PerformancePage } from '../features/performance/PerformancePage'

export const router = createBrowserRouter([
  {
    element: <Outlet />,
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
              { path: '/daily-orders', element: <DailyOrdersPage /> },
              { path: '/production-orders', element: <ProductionOrdersPage /> },
              { path: '/backlog', element: <Navigate to="/daily-orders" replace /> },
              { path: '/tablet', element: <TabletPage /> },
              { path: '/mobile', element: <MobilePage /> },
              { path: '/admin', element: <AdminPage /> },
              { path: '/alarms', element: <AlarmsPage /> },
              { path: '/references', element: <ReferencesPage /> },
              { path: '/performance', element: <PerformancePage /> },
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
