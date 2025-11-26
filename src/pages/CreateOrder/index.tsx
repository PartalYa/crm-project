import { Link, Navigate, Outlet } from 'react-router-dom';
import AngleLeft from '@assets/angle-left.svg?react';
import ArrowRight from '@assets/arrow-right.svg?react';
import CheckCircle from '@assets/check-circle.svg?react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import formatTime from '../../utils/formatTime';
import { useEffect, useState, useRef } from 'react';
import ClockIcon from '@assets/clock.svg?react';
import { resetCreateOrderStore, useCreateOrderStore } from '../../stores/createOrderStore';
import { useConfigStore } from '../../stores/configStore';
import { discountTypes } from '../../data/mockDropDowns';

export default function CreateOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentStep = location.pathname.split('/')[2];
  const { data, initializeWithDefaults } = useCreateOrderStore();
  const { config, loading, initializeConfig } = useConfigStore();
  console.log('data', data);

  const selectedClientId = data.selectedClient.id;
  const notificationSetting = data.notificationSetting;
  const isInitialized = useRef(false);
  // mock data before zustand
  const tabs = [
    {
      id: '1',
      label: 'Client',
      disabled: false,
      completed: data.selectedClient && data.selectedClient.id !== '',
    },
    {
      id: '2',
      label: 'Order',
      disabled:
        !selectedClientId ||
        !notificationSetting ||
        (notificationSetting === 2 && data.notificationNumber.length < 5),
      completed: data.receiverId,
    },
    {
      id: '3',
      label: 'Services',
      disabled:
        !selectedClientId ||
        !notificationSetting ||
        !data.receiverId ||
        (notificationSetting === 2 && data.notificationNumber.length < 5),
      completed: data.services.length > 0,
    },
    {
      id: '4',
      label: 'Products',
      disabled: true,
      completed: true,
    },
    {
      id: '5',
      label: 'Payment',
      disabled: !data.services.length,
      completed: false,
    },
    {
      id: '6',
      label: 'Comments',
      disabled: !data.services.length,
      completed: data.comments.length > 0,
    },
    {
      id: '7',
      label: 'Complete',
      disabled: !data.services.length,
      completed: false,
    },
  ];
  useEffect(() => {
    // Initialize config store if needed
    if (!config && !loading) {
      initializeConfig();
    }
  }, [config, loading, initializeConfig]);

  useEffect(() => {
    // Only initialize once when the component mounts and config is loaded
    if (!isInitialized.current && !loading && config) {
      resetCreateOrderStore();
      // Initialize the store with default values from config
      initializeWithDefaults(config);
      isInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, config]); // Only run when loading or config changes

  // util for price formatting where 0 is returned as ',00'
  const formatPrice = (price: number) => {
    return price === 0 ? ',00' : price.toFixed(2).replace('.', ',');
  };
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine if we should hide header/sidebar for service/photo subpages
  const hideHeaderSidebar =
    location.pathname.startsWith('/create-order/3/service') ||
    location.pathname.startsWith('/create-order/3/photo');

  const summ = data.services.reduce((acc, service) => {
    return acc + (service.price || 0) * (service.quantity || 1);
  }, 0);

  // each service can have its own % discount
  const summWithDiscounts = data.services.reduce((acc, service) => {
    const discount = service.discount ? (service.price || 0) * (service.discount / 100) : 0;
    return acc + (service.price || 0) * (service.quantity || 1) - discount;
  }, 0);

  if (
    location.pathname !== '/create-order/1/' &&
    location.pathname !== '/create-order/1' &&
    !data.selectedClient.id
  ) {
    // navigate('/create-order/1');
    return <Navigate to="/create-order/1" replace />;
  }

  console.log('CreateOrder component rendered with data:', data);

  return (
    <div className="flex flex-col gap-6 w-full py-4 pb-5 flex-1 h-full">
      {!hideHeaderSidebar && (
        <>
          <div className="flex items-center gap-[138px]">
            <Link
              to="/orders"
              className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] cursor-pointer flex items-center gap-2"
            >
              <AngleLeft className="w-6 h-6 transform" />
              <span className="text-md font-semibold leading-[16px]">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              {tabs.map((tab, index) => (
                <>
                  <button
                    key={index}
                    className={`nav-tag ${tab.disabled ? 'disabled' : ''} ${
                      currentStep === tab.id ? 'active' : ''
                    }`}
                    disabled={tab.disabled}
                    onClick={() => {
                      if (!tab.disabled) {
                        navigate(`/create-order/${tab.id}`);
                      }
                    }}
                  >
                    {tab.completed && !tab.disabled && currentStep !== tab.id && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {tab.label}
                  </button>
                  {index < tabs.length - 1 && <ArrowRight />}
                </>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full h-full flex-1">
            <div className="flex flex-col gap-2 w-[287px] h-full">
              <div className="flex gap-2 items-center justify-center w-full h-10 bg-green rounded-lg text-white cursor-default">
                <ClockIcon className="w-4 h-4" />
                <span className="text-md leading-[20px] font-semibold" title="Timer">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white border border-blue">
                <span className="text-base pt-[6px] leading-[26px] font-semibold text-black">
                  Order Information
                </span>
                <div className="divider-h" />{' '}
                <span className="text-base leading-[22px]">
                  Receive Date:{' '}
                  {data.receiveDate
                    ? new Date(data.receiveDate).toLocaleDateString('en-US')
                    : 'Not specified'}
                </span>
                <span className="text-base leading-[22px]">
                  Delivery Date:{' '}
                  {data.deliveryDate
                    ? new Date(data.deliveryDate).toLocaleDateString('en-US')
                    : 'Not specified'}
                </span>{' '}
                <span className="text-base leading-[22px]">
                  Urgency Type: {data.urgencyType === 'urgent' ? 'urgent' : 'not urgent'}
                </span>{' '}
                <span className="text-base leading-[22px]">
                  Company: {config?.defaultSettings?.company?.name || 'Not specified'}
                </span>
                <span className="text-base leading-[22px]">
                  Receiver: {config?.user?.name || 'Not specified'}
                </span>
                <div className="divider-h" />
                <span className="text-base pt-[6px] leading-[26px] font-semibold text-black">
                  Client Information
                </span>
                {data.selectedClient.name && (
                  <span className="text-base leading-[22px] truncate">
                    {data.selectedClient.name}
                  </span>
                )}
                {data.selectedClient.debt && (
                  <div className="flex justify-between text-base leading-[22px]">
                    <span>Debt on orders:</span>
                    <span className="font-semibold">{formatPrice(data.selectedClient.debt)}</span>
                  </div>
                )}
                {data.selectedClient.discount && (
                  <span className="text-base leading-[22px] truncate">
                    Discount scheme:{' '}
                    {data.selectedClient.discount &&
                      discountTypes.find((d) => d.value === data.selectedClient.discount)?.label}
                  </span>
                )}
                {data.selectedClient.phone && (
                  <span className="text-base leading-[22px] truncate">
                    Phone: {data.selectedClient.phone}
                  </span>
                )}
                <div className="divider-h" />{' '}
                <span className="pt-[6px] text-base leading-[26px] font-semibold">Payment</span>
                <span className="text-base leading-[22px]">Status: New</span>
                <div className="flex justify-between text-base leading-[22px]">
                  <span>Amount without discount:</span>
                  <span className="font-semibold">{formatPrice(summ)}</span>
                </div>
                <div className="flex justify-between text-base leading-[22px]">
                  <span>Amount:</span>
                  <span className="font-semibold">{formatPrice(summWithDiscounts)}</span>
                </div>
                <div className="flex justify-between text-base leading-[22px]">
                  <span>Paid:</span>
                  <span className="font-semibold">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold leading-[22px]">
                  <span>Debt:</span>
                  <span className="font-semibold">{formatPrice(summWithDiscounts)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <Outlet />
            </div>
          </div>
        </>
      )}
      {hideHeaderSidebar && (
        <div className="flex flex-col flex-1">
          <Outlet />
        </div>
      )}
    </div>
  );
}
