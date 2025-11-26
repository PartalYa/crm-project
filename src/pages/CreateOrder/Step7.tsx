import { useNavigate } from 'react-router';
import Button from '../../components/Button';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import { saveOrderFromCreateStore } from '../../utils/orderUtils';
import { useState } from 'react';
import BigCheck from '@assets/big-check.svg?react';

export default function Step7() {
  const { data } = useCreateOrderStore();
  const navigate = useNavigate();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const summWithDiscounts = data.services.reduce((acc, service) => {
    const discount = service.discount ? (service.price || 0) * (service.discount / 100) : 0;
    return acc + (service.price || 0) * (service.quantity || 1) - discount;
  }, 0);
  return (
    <>
      {orderCompleted && (
        <div className="fixed inset-0 bg-gray-accent py-4 px-8 z-10">
          <div className="w-full h-full flex items-center justify-center bg-white rounded-[10px]">
            <div className="flex flex-col items-center gap-6">
              <BigCheck className="w-[80px] h-[80px]" />
              <div className="flex flex-col items-center gap-4">
                <h1 className="text-xl font-semibold leading-[22px]">
                  Order №1 completed successfully
                </h1>
                <span className="text-md">
                  The order has been saved. You can print the receipt or create a new one.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  label="To Orders"
                  variant="ghost"
                  onClick={() => {
                    navigate('/orders');
                  }}
                />
                <Button
                  label="Print Receipt"
                  variant="primary"
                  onClick={() => {
                    // Handle print logic here
                    window.print();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col w-full h-full relative gap-2">
        <div className="bg-white rounded-2xl flex gap-6 items-center justify-between p-4 px-6">
          <h1>Completing Order №1</h1>
        </div>
        <div className="bg-white rounded-2xl py-4 px-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <span className="text-[20px] leading-[22px] font-semibold">
              Everything is ready to complete
            </span>
            <span className="text-md">Please review the data before confirming.</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1">
              <span className="text-md">Amount to Pay:</span>
              <span className="text-base font-semibold font-inter">${summWithDiscounts}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-md">Paid:</span>
              <span className="text-base font-semibold font-inter">${summWithDiscounts}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-md">Comment:</span>
              <span className="text-md">{data.comment || 'none'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-md">Status:</span>
              <span className="text-md">New</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => {
                navigate('/orders');
              }}
            />
            <Button
              label="Complete Order"
              variant="primary"
              onClick={() => {
                // Handle order completion logic here
                saveOrderFromCreateStore(data.companyId, data.receiverId);
                setOrderCompleted(true);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
