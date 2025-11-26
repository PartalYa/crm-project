// Example usage of the Radio component
import RadioGroup, { RadioItem } from '../components/Radio';
import { useState } from 'react';

export default function RadioExample() {
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Basic Radio Group</h2>
        <RadioGroup value={selectedValue} onValueChange={setSelectedValue} className="space-y-2">
          <RadioItem value="option1">
            <span>Option 1</span>
          </RadioItem>
          <RadioItem value="option2">
            <span>Option 2</span>
          </RadioItem>
          <RadioItem value="option3" disabled>
            <span>Option 3 (Disabled)</span>
          </RadioItem>
        </RadioGroup>
        <p className="mt-2 text-sm text-gray-600">Selected: {selectedValue}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Horizontal Radio Group with Custom Content</h2>
        <RadioGroup
          value={selectedPayment}
          onValueChange={setSelectedPayment}
          orientation="horizontal"
        >
          <RadioItem value="card">
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>Credit Card</span>
            </div>
          </RadioItem>
          <RadioItem value="cash">
            <div className="flex items-center gap-2">
              <span>💵</span>
              <span>Cash</span>
            </div>
          </RadioItem>
          <RadioItem value="crypto">
            <div className="flex items-center gap-2">
              <span>₿</span>
              <span>Crypto</span>
            </div>
          </RadioItem>
        </RadioGroup>
        <p className="mt-2 text-sm text-gray-600">Selected payment: {selectedPayment}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Error State</h2>
        <RadioGroup value="" onValueChange={() => {}}>
          <RadioItem value="error" error>
            <span>This option has an error</span>
          </RadioItem>
          <RadioItem value="normal">
            <span>This option is normal</span>
          </RadioItem>
        </RadioGroup>
      </div>
    </div>
  );
}
