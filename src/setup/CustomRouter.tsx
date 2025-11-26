import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import OrdersPage from '../pages/OrdersPage';
import Layout from './Layout';
import CreateOrder from '../pages/CreateOrder';
import Step1 from '../pages/CreateOrder/Step1';
import Step2 from '../pages/CreateOrder/Step2';
import Step3 from '../pages/CreateOrder/Step3';
import Step4 from '../pages/CreateOrder/Step4';
import Step5 from '../pages/CreateOrder/Step5';
import Step6 from '../pages/CreateOrder/Step6';
import Step7 from '../pages/CreateOrder/Step7';
import Step1Phone from '../pages/CreateOrder/Step1Phone';
import Step3Service from '../pages/CreateOrder/Step3Service';
import Step3Photo from '../pages/CreateOrder/Step3Photo';
import DashboardPage from '../pages/DashboardPage';
import GeneralReport from '../pages/DashboardPage/pages/GeneralReport';
import FinancialAnalysis from '../pages/DashboardPage/pages/FinancialAnalysis';
import RepeatClients from '../pages/DashboardPage/pages/RepeatClients';
import OrderStatuses from '../pages/DashboardPage/pages/OrderStatuses';
import WarehousePage from '../pages/WarehousePage';
import ReportPage from '../pages/ReportPage';
import ClientsPage from '../pages/ClientsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/orders" replace />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <div>Order Details Page</div>,
      },
      {
        path: 'create-order',
        element: <CreateOrder />,
        children: [
          {
            path: '1',
            element: <Outlet />,
            children: [
              { index: true, element: <Step1 /> },
              { path: 'phone', element: <Step1Phone /> },
            ],
          },
          { path: '2', element: <Step2 /> },
          {
            path: '3',
            element: <Outlet />,
            children: [
              { index: true, element: <Step3 /> },
              { path: 'service', element: <Step3Service /> },
              { path: 'photo', element: <Step3Photo /> },
            ],
          },
          { path: '4', element: <Step4 /> },
          { path: '5', element: <Step5 /> },
          { path: '6', element: <Step6 /> },
          { path: '7', element: <Step7 /> },
        ],
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        children: [
          { index: true, element: <Navigate to="/dashboard/general-report" replace /> },
          {
            path: 'general-report',
            element: <GeneralReport />,
          },
          {
            path: 'financial-analysis',
            element: <FinancialAnalysis />,
          },
          {
            path: 'order-statuses',
            element: <OrderStatuses />,
          },
          {
            path: 'repeat-clients',
            element: <RepeatClients />,
          },
        ],
      },
      {
        path: 'warehouse',
        element: <WarehousePage />,
      },
      {
        path: 'reports',
        element: <ReportPage />,
      },
      {
        path: 'clients',
        element: <ClientsPage />,
      },
    ],
  },
]);

const CustomRouter = () => {
  return <RouterProvider router={router} />;
};

export default CustomRouter;
