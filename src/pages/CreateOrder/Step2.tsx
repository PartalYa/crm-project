import { useState } from 'react';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import PhoneInputComponent from '../../components/PhoneInput';
import Input from '../../components/Input';
import Select from '../../components/Select';
import DatePicker from '../../components/DatePicker';
import Checkbox from '../../components/Checkbox';
import Textarea from '../../components/Input/Textarea';
import {
  companies,
  discountTypes,
  receivers,
  urgencyTypes,
  warehouses,
} from '../../data/mockDropDowns';
import { useCreatedOrdersStore } from '../../stores/createdOrders';

export default function Step2() {
  const navigate = useNavigate();
  const { data, updateData } = useCreateOrderStore();
  // Format date for datepicker (DD.MM.YYYY)
  const formatDateString = (date: Date): string => {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${date.getFullYear()}`;
  };

  const { orders } = useCreatedOrdersStore();

  // Generate a random order number
  const generateOrderNumber = (): string => {
    if (orders.length === 0) {
      return '01485-45';
    }
    const prefix = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const suffix = Math.floor(10 + Math.random() * 90); // 2-digit number
    return `${prefix}-${suffix}`;
  };

  // Set default dates if they're not already set

  // Local state for form values
  const [orderNumber, setOrderNumber] = useState(data.orderNumber || generateOrderNumber());
  const [tagNumber, setTagNumber] = useState(data.tagNumber || '');
  const [receiveDate, setReceiveDate] = useState(data.receiveDate);
  const [deliveryDate, setDeliveryDate] = useState(data.deliveryDate);
  const [receiveTime, setReceiveTime] = useState(data.receiveTime || '');
  const [deliveryTime, setDeliveryTime] = useState(data.deliveryTime || '');
  const [selectedWarehouse, setSelectedWarehouse] = useState(data.warehouseId || '');
  const [selectedDeliveryWarehouse, setSelectedDeliveryWarehouse] = useState(
    data.deliveryWarehouseId || '',
  );
  const [selectedUrgency, setSelectedUrgency] = useState(data.urgencyType || '');
  const [phone, setPhone] = useState(data.notificationNumber || '');
  const [discountScheme, setDiscountScheme] = useState(data.selectedClient.discount || '');
  const [discount, setDiscount] = useState(data.discount || '');
  const [selectedReceiver, setSelectedReceiver] = useState(data.receiverId || '');
  const [selectedCompany, setSelectedCompany] = useState(data.companyId || '');
  const [comment, setComment] = useState(data.comment || '');
  const [isReturn, setIsReturn] = useState(data.isReturn || false);
  const [isPartnerOrder, setIsPartnerOrder] = useState(data.isPartnerOrder || false);

  // Form validation
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Mock options for selects

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string | null } = {};

    // Required fields validation
    if (!selectedWarehouse) newErrors.warehouseId = 'Warehouse is required';
    if (!selectedReceiver) newErrors.receiverId = 'Receiver is required';
    if (!selectedUrgency) newErrors.urgencyType = 'Urgency is required';

    // Date validation
    if (!receiveDate) {
      newErrors.receiveDate = 'Receive date is required';
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else {
      // Delivery date should be after or on the receive date
      try {
        const [dayRec, monthRec, yearRec] = receiveDate.split('.').map(Number);
        const [dayDel, monthDel, yearDel] = deliveryDate.split('.').map(Number);

        const recDate = new Date(yearRec, monthRec - 1, dayRec);
        const delDate = new Date(yearDel, monthDel - 1, dayDel);

        if (delDate < recDate) {
          newErrors.deliveryDate = 'Delivery date must be after receive date';
        }
      } catch (e) {
        newErrors.deliveryDate = 'Invalid date format';
      }
    }

    // Time format validation
    if (deliveryTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(deliveryTime)) {
        newErrors.deliveryTime = 'Invalid time format (HH:MM)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Save all form data to the store before navigating
      updateData({
        orderNumber,
        tagNumber,
        receiveDate,
        deliveryDate,
        deliveryTime,
        receiveTime,
        warehouseId: selectedWarehouse,
        urgencyType: selectedUrgency,
        notificationNumber: phone,
        discount,
        receiverId: selectedReceiver,
        companyId: selectedCompany,
        comment,
        isReturn,
        isPartnerOrder,
      });

      navigate('/create-order/3');
    }
  };

  return (
    <div className="flex flex-col w-full h-full relative gap-2">
      <div className="bg-white rounded-2xl flex gap-6 items-center p-4 px-6 justify-between">
        <h1>Order Details</h1>
        <Button
          label="Next"
          onClick={handleNext}
          variant="tertiary"
          size="medium"
          className="flex-shrink-0"
        />
      </div>

      <div className="bg-white rounded-2xl flex flex-col py-4 px-6 relative overflow-visible gap-6">
        {/* Row 1: Order Number and Registry Number */}{' '}
        <div className="flex items-start gap-6">
          <Input
            label="Order Number"
            placeholder="Order Number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            wrapperClassName="w-[332px]"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
            disabled
          />

          <Input
            label="Tag"
            placeholder="Tag"
            value={tagNumber}
            wrapperClassName="w-[332px]"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
            disabled
          />
        </div>
        {/* Row 2: Receive Date and Delivery Date */}{' '}
        <div className="flex items-start gap-6">
          <DatePicker
            label="Receive Date"
            placeholder="Select a date"
            value={receiveDate}
            onChange={(date) => setReceiveDate(date as string)}
            wrapperClassName="w-[332px]"
            error={errors.receiveDate || ''}
          />
          <DatePicker
            label="Delivery Date"
            placeholder="Select a date"
            value={deliveryDate}
            onChange={(date) => setDeliveryDate(date as string)}
            wrapperClassName="w-[332px]"
            error={errors.deliveryDate || ''}
          />{' '}
        </div>{' '}
        <div className="flex items-start gap-6">
          <Input
            label="Receive Time"
            placeholder="HH:MM"
            value={receiveTime}
            onChange={(e) => {
              const input = e.target.value;
              // Remove all non-digit characters
              const digits = input.replace(/\D/g, '');

              // Limit to 4 digits
              const limitedDigits = digits.slice(0, 4);

              // Format with colon
              let formattedTime = '';
              if (limitedDigits.length >= 1) {
                formattedTime = limitedDigits.slice(0, 2);
                if (limitedDigits.length >= 3) {
                  formattedTime += ':' + limitedDigits.slice(2, 4);
                }
              }

              setReceiveTime(formattedTime);
            }}
            wrapperClassName="w-[332px]"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
            error={errors.deliveryTime || ''}
            maxLength={5}
            inputMode="numeric"
          />
          <Input
            label="Delivery Time"
            placeholder="HH:MM"
            value={deliveryTime}
            onChange={(e) => {
              const input = e.target.value;
              // Remove all non-digit characters
              const digits = input.replace(/\D/g, '');

              // Limit to 4 digits
              const limitedDigits = digits.slice(0, 4);

              // Format with colon
              let formattedTime = '';
              if (limitedDigits.length >= 1) {
                formattedTime = limitedDigits.slice(0, 2);
                if (limitedDigits.length >= 3) {
                  formattedTime += ':' + limitedDigits.slice(2, 4);
                }
              }

              setDeliveryTime(formattedTime);
            }}
            wrapperClassName="w-[332px]"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
            error={errors.deliveryTime || ''}
            maxLength={5}
            inputMode="numeric"
          />
        </div>
        {/* Row 3: Delivery Time and Warehouse */}{' '}
        <div className="flex items-start gap-6">
          <Select
            label="Receive Warehouse"
            placeholder="Select a warehouse"
            options={warehouses}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            wrapperClassName="w-[332px]"
            error={errors.warehouseId || ''}
          />
          <Select
            label="Delivery Warehouse"
            placeholder="Select a warehouse"
            options={warehouses}
            value={selectedDeliveryWarehouse}
            onChange={setSelectedDeliveryWarehouse}
            wrapperClassName="w-[332px]"
            error={errors.warehouseId || ''}
          />
        </div>
        <Select
          label="Urgency"
          placeholder="Select a type"
          options={urgencyTypes}
          value={selectedUrgency}
          onChange={setSelectedUrgency}
          wrapperClassName="w-[332px]"
          error={errors.urgencyType || ''}
        />
        {data.notificationSetting !== 3 && (
          <PhoneInputComponent
            label="Phone for Notifications"
            placeholder="Enter phone number"
            value={data.notificationSetting === 1 ? data.selectedClient.phone : phone}
            onChange={(value) => setPhone(value)}
            defaultCountry="UA"
            wrapperClassName="w-[332px]"
            error={errors.phone || ''}
            disabled={data.notificationSetting === 1}
          />
        )}
        {/* Row 5: Discount Scheme */}
        <div className="flex items-start gap-6">
          <Select
            label="External Discount Scheme"
            placeholder="Select a discount scheme"
            options={discountTypes}
            value={discountScheme}
            onChange={setDiscountScheme}
            wrapperClassName="w-[332px]"
          />
          <Input
            label="№"
            placeholder="#"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            wrapperClassName="w-[332px]"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
          />
        </div>
        <Select
          label="Receiver"
          placeholder="Select a receiver"
          options={receivers}
          value={selectedReceiver}
          onChange={setSelectedReceiver}
          wrapperClassName="w-[332px]"
          error={errors.receiverId || ''}
        />
        <Select
          label="Company"
          placeholder="Select a company"
          options={companies}
          value={selectedCompany}
          onChange={setSelectedCompany}
          wrapperClassName="w-[332px]"
          error={errors.companyId || ''}
        />
        {/* Row 7: Comment */}
        <div className="flex items-start gap-6">
          <Textarea
            label="Comment"
            placeholder="Enter a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            wrapperClassName="w-[688px]"
          />
        </div>
        {/* Row 8: Checkboxes */}
        <div className="divider-h" />
        <div className="flex flex-col gap-4">
          {' '}
          <Checkbox
            label="Return"
            checked={isReturn}
            onCheckedChange={(checked) => setIsReturn(!!checked)}
          />
          <Checkbox
            label="Partner Order"
            checked={isPartnerOrder}
            onCheckedChange={(checked) => setIsPartnerOrder(!!checked)}
          />
        </div>
      </div>
    </div>
  );
}
