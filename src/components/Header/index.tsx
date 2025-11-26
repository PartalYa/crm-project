import Header2 from '@assets/header/header2.svg?react';
import Header3 from '@assets/header/header3.svg?react';
import Header4 from '@assets/header/header4.svg?react';
import Header6 from '@assets/header/header6.svg?react';
import Header7 from '@assets/header/header7.svg?react';
import Header8 from '@assets/header/header8.svg?react';
import Header9 from '@assets/header/header9.svg?react';
import Header10 from '@assets/header/header10.svg?react';
import Header11 from '@assets/header/header11.svg?react';
import Logo from '@assets/logo.svg?react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useConfigStore } from '../../stores/configStore';
import { useCreatedOrdersStore } from '../../stores/createdOrders';

const HeaderNavButton = ({
  icon,
  label,
  to,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  disabled?: boolean;
}) => {
  return (
    <NavLink
      to={to || '#'}
      className={`flex px-4 items-center flex-col justify-center gap-1 text-center text-black hover:text-blue-hover active:text-blue-active transition-[.2s] cursor-pointer [&.active]:text-blue ${
        disabled ? 'cursor-default opacity-50 !text-black' : ''
      }`}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {icon}
      <span className="font-medium text-md">{label}</span>
    </NavLink>
  );
};

const UserMenu = ({
  config,
}: {
  config: { user: { name: string; initials: string }; business: { name: string; point: string } };
}) => {
  const { clearAllOrders } = useCreatedOrdersStore();
  return (
    <div className="shadow bg-white rounded-lg p-2 absolute right-0 top-[47px] w-[296px] flex flex-col gap-2 z-50">
      <div className="flex justify-end">
        <div className="tag">Receiver</div>
      </div>
      <div className="flex items-center gap-4 px-2">
        <div className="bg-gray-accent font-medium w-[40px] h-[40px] rounded-lg flex items-center justify-center">
          {config.user.initials}
        </div>
        <span className="text-md font-semibold">{config.user.name}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-base p-2 text-left">{config.business.name}</span>
        <span className="text-base p-2 text-left">{config.business.point}</span>
      </div>
      <div className="divider-h"></div>
      <button
        onClick={clearAllOrders}
        className="text-left text-base p-2 font-semibold w-full hover:text-blue transition-[.2s] rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { config, loading } = useConfigStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <header className="h-[79px] px-8 flex items-center justify-between mb-6 flex-shrink-0">
        <Logo />
        <div className="flex items-center">Loading...</div>
        <div className="w-[47px] h-[47px]"></div>
      </header>
    );
  }

  return (
    <header className="h-[79px] px-8 flex items-center justify-between mb-6 flex-shrink-0">
      <Logo />
      <div className="flex items-center">
        <HeaderNavButton
          icon={<Header10 className="fill-current" />}
          label="Dashboard"
          to="/dashboard"
        />
        <HeaderNavButton
          icon={<Header11 className="fill-current" />}
          label="Warehouse"
          to="/warehouse"
        />
        <HeaderNavButton
          icon={<Header2 className="fill-current" />}
          label="Clients"
          to="/clients"
        />
        <HeaderNavButton
          icon={<Header3 className="stroke-current" />}
          label="Orders"
          to="/orders"
        />
        <HeaderNavButton
          icon={<Header4 className="stroke-current" />}
          label="Order Registers"
          to="/order-registers"
          disabled
        />
        <HeaderNavButton
          icon={<Header6 className="fill-current" />}
          label="Payments"
          to="/payments"
          disabled
        />
        <HeaderNavButton
          icon={<Header7 className="fill-current" />}
          label="Finance"
          to="/finance"
          disabled
        />
        <HeaderNavButton
          icon={<Header8 className="fill-current" />}
          label="Reports"
          to="/reports"
        />
        <HeaderNavButton
          icon={<Header9 className="fill-current" />}
          label="Other"
          to="/other"
          disabled
        />
      </div>{' '}
      <div className="relative">
        <button
          className={`flex items-center justify-center w-[47px] h-[47px] border border-white transition-[.2s] rounded-lg bg-white text-md font-medium text-black hover:border-blue ${
            isUserMenuOpen ? '!border-blue-active' : ''
          }`}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          {config?.user?.initials || 'JD'}
        </button>
        {isUserMenuOpen && config && <UserMenu config={config} />}
      </div>
    </header>
  );
}
