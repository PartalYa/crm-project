import { useEffect, useState } from 'react';
import AngleLeft from '@assets/angle-left.svg?react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Input/Textarea';
import Checkbox from '../../components/Checkbox';
import ImageIcon from '@assets/image.svg?react';
import { useCreateOrderStore, Service } from '../../stores/createOrderStore';
import RadioGroup, { RadioItem } from '../../components/Radio';

const markupOptions = [
  { value: 'none', label: 'No markup' },
  { value: 'fixed', label: 'Fixed markup' },
  { value: 'percentage', label: 'Percentage markup' },
];

const extraOptionsList = [
  'Additional removal of fuzziness (*1.3)',
  "Cleaning, dyeing of children's clothes (up to size 40) (*0.5)",
  'Especially dirty items (*2)',
  'Combined product 1 small insert (*1.3)',
  'Combined product 2 or more small inserts (*2)',
  'Combined product large inserts',
];
const wearOptions = ['10', '30', '50', '75'];
const conditionOptions = ['Refused repair'];
const markingOptions = [
  "No marking. Accepted at the client's request.",
  'Marking: all types of processing are prohibited.',
];

export default function Step3Service() {
  const navigate = useNavigate();
  const { data, setSelectedService, addService, clearSelectedService, initiateSelectedService } =
    useCreateOrderStore();

  const tempServiceInfo = data.tempServiceInfo;
  const selected = data.selectedService || {};
  console.log('Step3Service data:', data); // Local state mirrors selectedService for controlled inputs
  const [quantity, setQuantity] = useState<number | string>(selected.quantity || 1);
  const [coefficient, setCoefficient] = useState<number | string>(selected.coefficient || 1);
  const tagNumber = selected.tagNumber;
  const [priceInput, setPriceInput] = useState<number | string>(tempServiceInfo?.price || 0);
  const [discount, setDiscount] = useState<number | string>(selected.discount || 0);
  const [markup, setMarkup] = useState(selected.markup || 'none');
  const [description, setDescription] = useState(selected.description || '');
  const [extraOptions, setExtraOptions] = useState<string[]>(selected.extraOptions || []);
  const [wear, setWear] = useState(selected.wear || '');
  const [conditions, setConditions] = useState<string[]>(selected.conditions || []);
  const [marking, setMarking] = useState<string[]>(selected.marking || []);
  const [labelNote, setLabelNote] = useState(selected.labelNote || '');
  useEffect(() => {
    // Initialize selectedService only if we have tempServiceInfo but no selectedService
    if (tempServiceInfo && !selected.tagNumber) {
      initiateSelectedService();
    }
  }, [tempServiceInfo, selected.tagNumber, initiateSelectedService]);
  // Sync local state to store.selectedService on change
  useEffect(() => {
    const numQuantity =
      typeof quantity === 'string' ? (quantity === '' ? 0 : Number(quantity)) : quantity;
    const numCoefficient =
      typeof coefficient === 'string'
        ? coefficient === ''
          ? 0
          : Number(coefficient)
        : coefficient;
    const numPriceInput =
      typeof priceInput === 'string' ? (priceInput === '' ? 0 : Number(priceInput)) : priceInput;
    const numDiscount =
      typeof discount === 'string' ? (discount === '' ? 0 : Number(discount)) : discount;

    setSelectedService({
      ...selected,
      quantity: numQuantity,
      coefficient: numCoefficient,
      priceInput: numPriceInput,
      discount: numDiscount,
      markup,
      description,
      extraOptions,
      wear,
      conditions,
      marking,
      labelNote,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quantity,
    coefficient,
    priceInput,
    discount,
    markup,
    description,
    extraOptions,
    wear,
    conditions,
    marking,
    labelNote,
  ]);

  // Clear temp service if user leaves this page
  // useEffect(() => {
  //   return () => {
  //     clearSelectedService();
  //   };
  // }, [clearSelectedService]);
  // Validation: require quantity, priceInput, tagNumber
  const numQuantity =
    typeof quantity === 'string' ? (quantity === '' ? 0 : Number(quantity)) : quantity;
  const numPriceInput =
    typeof priceInput === 'string' ? (priceInput === '' ? 0 : Number(priceInput)) : priceInput;
  const isFilled = numQuantity > 0 && numPriceInput > 0 && tagNumber && tagNumber.trim() !== '';
  const handleSave = () => {
    if (!isFilled) return;
    // Convert string values to numbers for saving
    const numQuantity =
      typeof quantity === 'string' ? (quantity === '' ? 0 : Number(quantity)) : quantity;
    const numCoefficient =
      typeof coefficient === 'string'
        ? coefficient === ''
          ? 0
          : Number(coefficient)
        : coefficient;
    const numPriceInput =
      typeof priceInput === 'string' ? (priceInput === '' ? 0 : Number(priceInput)) : priceInput;
    const numDiscount =
      typeof discount === 'string' ? (discount === '' ? 0 : Number(discount)) : discount;

    // Save to services list and clear temp
    addService({
      ...selected,
      id: tempServiceInfo?.id || '',
      name: tempServiceInfo?.name || '',
      group: tempServiceInfo?.group || '',
      price: tempServiceInfo?.price || 0,
      quantity: numQuantity,
      coefficient: numCoefficient,
      tagNumber,
      priceInput: numPriceInput,
      discount: numDiscount,
      markup,
      description,
      extraOptions,
      wear,
      conditions,
      marking,
      labelNote,
      photos: selected.photos || [],
    } as Service);
    navigate('/create-order/3');
  };

  const handleCancel = () => {
    clearSelectedService();
    navigate('/create-order/3');
  };

  // Checkbox helpers
  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  if (!data.tempServiceInfo) {
    return (
      <Navigate
        to="/create-order/3"
        replace={true}
        state={{ error: 'No service info available' }}
      />
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 h-full overflow-y-auto py-4 gap-2">
      <div className="bg-white rounded-2xl flex items-center justify-between p-4 px-6">
        <div className="flex items-center gap-2">
          <Link
            to="/create-order/3"
            className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] cursor-pointer flex items-center gap-2"
            onClick={handleCancel}
          >
            <AngleLeft className="w-6 h-6 transform" />
          </Link>
          <h1>Service Parameters</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button label="Cancel" onClick={handleCancel} variant="ghost" />
          <Button label="Save" onClick={handleSave} variant="primary" disabled={!isFilled} />
        </div>
      </div>
      <div className="bg-white rounded-2xl flex flex-col gap-6 p-4 px-6">
        <div className="flex flex-col gap-4">
          <span className="text-md font-semibold">
            Service: {`${tempServiceInfo?.name.split(' ')[0] || 'Unknown service'}, pcs`}
          </span>
          <div className="flex items-center gap-6">
            {' '}
            <Input
              label="Quantity"
              type="number"
              placeholder="Enter quantity"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Coefficient"
              type="number"
              placeholder="Enter coefficient"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              value={coefficient}
              onChange={(e) => setCoefficient(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Tag Number"
              type="text"
              placeholder="Enter tag number"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              disabled
              value={tagNumber}
            />
          </div>
          <div className="divider-h" />
          <div className="flex items-center gap-6">
            {' '}
            <Input
              label="Price"
              type="number"
              placeholder="Enter price"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Discount"
              type="number"
              placeholder="Enter discount"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              value={discount}
              onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Select
              label="Markup"
              options={markupOptions}
              value={markup}
              placeholder="Select markup"
              onChange={setMarkup}
              wrapperClassName="w-[332px]"
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Add a description..."
            wrapperClassName="w-[688px]"
            textareaClassName="w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="bg-white rounded-2xl flex flex-col gap-4 p-4 px-6 flex-1">
          <span className="text-md font-semibold">Additional Details</span>
          {extraOptionsList.map((opt) => (
            <Checkbox
              key={opt}
              label={opt}
              checked={extraOptions.includes(opt)}
              onCheckedChange={() => setExtraOptions(toggleInArray(extraOptions, opt))}
            />
          ))}
          <div className="divider-h" />
          <span className="text-md font-semibold">Wear %</span>
          <RadioGroup value={wear} onValueChange={setWear} className="gap-4">
            {wearOptions.map((opt) => (
              <RadioItem key={opt} value={opt}>
                <span className="text-base leading-[22px]">{opt}</span>
              </RadioItem>
            ))}
          </RadioGroup>
          <div className="divider-h" />
          <span className="text-md font-semibold">Acceptance Conditions</span>
          {conditionOptions.map((opt) => (
            <Checkbox
              key={opt}
              label={opt}
              checked={conditions.includes(opt)}
              onCheckedChange={() => setConditions(toggleInArray(conditions, opt))}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="bg-white rounded-2xl flex flex-col gap-6 p-4 px-6">
            <span className="text-md font-semibold">Product Characteristics</span>
            {/* For demo, just show static fields. You can add more logic here. */}
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Type of processing
            </div>
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Brand
            </div>
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Color
            </div>
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Missing elements
            </div>
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Hardware and decor
            </div>
            <div className="px-4 py-[13px] border border-[#EFF1F6] rounded-lg text-base leading-[22px] font-semibold">
              Defects
            </div>
          </div>
          <div className="bg-white rounded-2xl flex flex-col gap-6 p-4 px-6">
            <span className="text-md font-semibold">Marking</span>
            {markingOptions.map((opt) => (
              <Checkbox
                key={opt}
                label={opt}
                checked={marking.includes(opt)}
                onCheckedChange={() => setMarking(toggleInArray(marking, opt))}
              />
            ))}
          </div>
          <div className="bg-white rounded-2xl flex flex-col gap-6 p-4 px-6">
            <Input
              label="Label Note / Linear Dimensions"
              placeholder="Enter note"
              inputClassName="w-full"
              wrapperClassName="w-[332px]"
              inputWrapperClassName="w-full"
              value={labelNote}
              onChange={(e) => setLabelNote(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl flex items-center justify-between p-4 px-6">
        <Link to="/create-order/3/photo">
          <Button label="Add Photo" onClick={() => {}} variant="tertiary" icon={<ImageIcon />} />
        </Link>
      </div>
    </div>
  );
}
