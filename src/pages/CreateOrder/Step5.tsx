import Button from '../../components/Button';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import { useNavigate } from 'react-router-dom';
import CashIcon from '@assets/cash.svg?react';
import BankIcon from '@assets/bank.svg?react';
import CardIcon from '@assets/card.svg?react';
import StarIcon from '@assets/star.svg?react';
import DollarIcon from '@assets/dollar.svg?react';

const paymentMethods = [
  {
    id: 'cash',
    label: 'Cash',
    icon: CashIcon,
    disabled: false,
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    icon: BankIcon,
    disabled: false,
  },
  {
    id: 'card',
    label: 'Card',
    icon: CardIcon,
    disabled: false,
  },
  {
    id: 'bonus',
    label: 'Bonus Points',
    icon: StarIcon,
    disabled: true,
  },
  {
    id: 'dollar',
    label: 'Deposit',
    icon: DollarIcon,
    disabled: false,
  },
];

export default function Step5() {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/create-order/6');
  };
  const { data } = useCreateOrderStore();
  return (
    <div className="flex flex-col w-full h-full relative gap-2">
      <div className="bg-white rounded-2xl flex gap-6 items-center justify-between p-4 px-6">
        <h1>Payment</h1>
        <Button
          label="Next"
          onClick={handleNext}
          variant="tertiary"
          size="medium"
          className="flex-shrink-0"
          // disabled={!selectedClientId}
        />
      </div>
      <div className="bg-white  rounded-2xl flex w-full py-4 px-6 relative gap-4">
        {paymentMethods.map((payment) => (
          <button
            className={`flex items-center gap-2 p-4 border border-border rounded-lg hover:text-blue transition-[.2s] ${
              payment.disabled ? '!text-gray cursor-not-allowed' : 'cursor-pointer'
            }`}
            key={payment.id}
          >
            {payment.icon && (
              <div className="w-6 h-6">
                <payment.icon className="w-full h-full" />
              </div>
            )}
            <span className="text-base font-semibold">{payment.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
