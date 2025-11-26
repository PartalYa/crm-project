import { useNavigate } from 'react-router-dom';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import Button from '../../components/Button';
import RadioGroup, { RadioItem } from '../../components/Radio';
import Checkbox from '../../components/Checkbox';
import PhoneInputComponent from '../../components/PhoneInput';

export default function Step1Phone() {
  const navigate = useNavigate();
  const { data, setOrderValue } = useCreateOrderStore();

  const handleNext = () => {
    navigate('/create-order/2');
  };

  const onRadioChange = (value: string) => {
    const numericValue = parseInt(value) as 1 | 2 | 3;
    setOrderValue('notificationSetting', numericValue);
  };

  return (
    <div className="flex flex-col w-full h-full relative gap-2">
      <div className="bg-white rounded-2xl flex gap-6 items-center p-4 px-6 justify-between">
        <h1>Notification Phone Number</h1>
        <Button
          label="Next"
          onClick={handleNext}
          variant="tertiary"
          size="medium"
          className="flex-shrink-0"
          disabled={
            !data.notificationSetting ||
            (data.notificationSetting === 2 && data.notificationNumber.length < 5)
          }
        />
      </div>

      <div className="bg-white rounded-2xl flex flex-col py-4 px-6 relative overflow-visible gap-4">
        <h2 className="text-lg font-semibold">Notification Settings</h2>

        <div className="flex flex-col gap-4">
          {' '}
          <div>
            <RadioGroup
              value={data.notificationSetting?.toString() || ''}
              onValueChange={onRadioChange}
              orientation="vertical"
              className="gap-3"
            >
              <RadioItem value="1">
                <PhoneInputComponent
                  value={data.selectedClient.phone} // Placeholder for phone input
                  disabled={true}
                  defaultCountry="UA"
                  forceDialCode={true}
                  label="Notification Phone Number"
                  wrapperClassName="w-[332px]"
                  inputClassName="w-full [&_input]:!text-black [&_input]:!opacity-100"
                  placeholder="Enter phone number"
                />
              </RadioItem>
              <RadioItem value="2">
                <PhoneInputComponent
                  label="New number for client card"
                  value={data.notificationNumber || ''}
                  onChange={(value) => setOrderValue('notificationNumber', value)}
                  placeholder="Enter phone number"
                  defaultCountry="UA"
                  forceDialCode={false}
                  wrapperClassName="w-[332px]"
                  inputClassName="w-full"
                />
              </RadioItem>
              <RadioItem value="3">
                <span className="text-base leading-[22px]">Do not use phone for notifications</span>
              </RadioItem>
            </RadioGroup>
          </div>
          <div className="divider-h" />
          <div className="flex flex-col gap-3 mt-4">
            <Checkbox
              checked={data.isNotificationsAgree}
              onCheckedChange={(value) => setOrderValue('isNotificationsAgree', value)}
              label="Client agrees to receive notifications about order readiness"
            />
            <Checkbox
              checked={data.isReceiptAgree}
              onCheckedChange={(value) => setOrderValue('isReceiptAgree', value)}
              label="Send receipt and order changes"
            />
            <Checkbox
              checked={data.isAdvertAgree}
              onCheckedChange={(value) => setOrderValue('isAdvertAgree', value)}
              label="Client agrees to receive promotional and greeting messages"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
