import { Link, Outlet, useLocation } from 'react-router-dom';

const dashboardPages = [
  {
    title: 'General Report',
    path: '/dashboard/general-report',
  },
  {
    title: 'Financial Analysis',
    path: '/dashboard/financial-analysis',
  },
  {
    title: 'Order Statuses',
    path: '/dashboard/order-statuses',
  },
  {
    title: 'Repeat Clients and Reworks',
    path: '/dashboard/repeat-clients',
  },
];

export default function DashboardPage() {
  const location = useLocation();
  const currentPage = dashboardPages.find((page) => page.path === location.pathname);
  return (
    <div className=" flex-1 w-full flex gap-2 ">
      <div className="p-4 bg-white rounded-2xl flex flex-col gap-4 w-[287px] shrink-0 h-fit">
        <h1 className="pl-2">Dashboard</h1>
        <div className="flex flex-col gap-2">
          {dashboardPages.map((page, index) => (
            <Link
              key={index}
              to={page.path}
              className={`w-full p-2 rounded-lg hover:bg-green-accent transition-[.2s] ${
                currentPage?.path.startsWith(page.path) ? 'bg-green-accent text-blue' : ''
              }`}
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 h-full flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
