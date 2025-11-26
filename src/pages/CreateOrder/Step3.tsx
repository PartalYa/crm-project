import { useState, useEffect, useRef, useMemo } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@assets/search.svg?react';
import Accordion from '../../components/Accordion';
import Wind1 from '../../assets/services/wind1.png';
import Wind2 from '../../assets/services/wind2.png';
import Tie1 from '../../assets/services/tie1.png';
import Tie2 from '../../assets/services/tie2.png';
import Coat1 from '../../assets/services/coat1.png';
import Coat2 from '../../assets/services/coat2.png';
import Costume1 from '../../assets/services/costume1.webp';
import Costume2 from '../../assets/services/costume2.png';
import Dress1 from '../../assets/services/dress1.png';
import Dress2 from '../../assets/services/dress2.webp';
import Gloves from '../../assets/services/gloves.png';
import Socks from '../../assets/services/socks.png';
import Hat1 from '../../assets/services/hat1.webp';
import Hat2 from '../../assets/services/hat2.png';
import Jacket1 from '../../assets/services/jacket1.webp';
import Jacket2 from '../../assets/services/jacket2.png';
import Knit1 from '../../assets/services/knit1.png';
import Knit2 from '../../assets/services/knit2.webp';
import Skii1 from '../../assets/services/skii1.png';
import Skii2 from '../../assets/services/skii2.webp';

import ProductCard from '../../components/ProductCard';
import Checkbox from '../../components/Checkbox';

const mockProducts = [
  {
    id: '1',
    name: 'Windbreaker with a complex design and/or decoration',
    image: Wind1,
    price: 550,
  },
  {
    id: '2',
    name: 'Windbreaker with a simple design',
    image: Wind2,
    price: 510,
  },
];

const serviceGroups = [
  {
    title: '01.01 Accessories',
    group: '01.01 Accessories',
    services: [
      {
        id: '1',
        image: Tie1,
        name: 'Tie',
        price: 100,
      },
      {
        id: '2',
        image: Tie2,
        name: 'Bow Tie',
        price: 120,
      },
    ],
  },
  {
    title: '01.02 Suit Group',
    group: '01.02 Suit Group',
    services: [
      {
        id: '1',
        image: Costume1,
        name: 'Jacket',
        price: 800,
      },
      {
        id: '2',
        image: Costume2,
        name: 'Trousers',
        price: 600,
      },
    ],
  },
  {
    title: '01.03 Dress Group',
    group: '01.03 Dress Group',
    services: [
      {
        id: '1',
        image: Dress1,
        name: 'Dress',
        price: 700,
      },
      {
        id: '2',
        image: Dress2,
        name: 'Skirt',
        price: 500,
      },
    ],
  },
  {
    title: '01.04 Knitwear',
    group: '01.04 Knitwear',
    services: [
      {
        id: '1',
        image: Knit1,
        name: 'Sweater',
        price: 400,
      },
      {
        id: '2',
        image: Knit2,
        name: 'Knitwear Trousers',
        price: 350,
      },
    ],
  },
  {
    title: '01.05 Coat Group / 01.Coats, half-coats, raincoats',
    group: '01.05 Coat Group / 01.Coats, half-coats, raincoats',
    services: [
      {
        id: '1',
        image: Coat1,
        name: 'Coat',
        price: 900,
      },
      {
        id: '2',
        image: Coat2,
        name: 'Half-Coat',
        price: 850,
      },
    ],
  },
  {
    title: '01.05 Coat Group / 02. Jackets, insulated coats',
    group: '01.05 Coat Group / 02. Jackets, insulated coats',
    services: [
      {
        id: '1',
        image: Jacket1,
        name: 'Puffer Jacket',
        price: 750,
      },
      {
        id: '2',
        image: Jacket2,
        name: 'Puffer Coat',
        price: 800,
      },
    ],
  },
  {
    title: '01.05 Coat Group / 03.Overalls, semi-overalls, insulated suits, ski suits',
    group: '01.05 Coat Group / 03.Overalls, semi-overalls, insulated suits, ski suits',
    services: [
      {
        id: '1',
        image: Skii1,
        name: 'Overall',
        price: 950,
      },
      {
        id: '2',
        image: Skii2,
        name: 'Ski Pants',
        price: 600,
      },
    ],
  },
  {
    title: '01.05 Coat Group / 04. Sports jackets, summer, jeans, demi-season',
    group: '01.05 Coat Group / 04. Sports jackets, summer, jeans, demi-season',
    services: mockProducts,
  },
  {
    title: '01.06 Miscellaneous',
    group: '01.06 Miscellaneous',
    services: [
      {
        id: '1',
        image: Gloves,
        name: 'Gloves',
        price: 150,
      },
      {
        id: '2',
        image: Socks,
        name: 'Socks',
        price: 50,
      },
    ],
  },
  {
    title: '01.07 Headwear',
    group: '01.07 Headwear',
    services: [
      {
        id: '1',
        image: Hat1,
        name: 'Hat',
        price: 200,
      },
      {
        id: '2',
        image: Hat2,
        name: 'Cap',
        price: 180,
      },
    ],
  },
];

export default function Step3() {
  const navigate = useNavigate();
  const { data, setTempServiceInfo } = useCreateOrderStore();

  // Search configuration - internal variables that can be tweaked
  const SEARCH_DEBOUNCE_DELAY = 1000; // milliseconds
  const ENABLE_SEARCH_TIMER = true; // set to false to disable timer-based search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search state
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // The actual search term being used for filtering
  // Load manually opened accordions from localStorage
  const loadManuallyOpenedAccordions = (): Set<string> => {
    try {
      const stored = localStorage.getItem('manuallyOpenedAccordions');
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load manually opened accordions from localStorage:', error);
    }
    return new Set();
  };

  // Save manually opened accordions to localStorage
  const saveManuallyOpenedAccordions = (accordions: Set<string>) => {
    try {
      localStorage.setItem('manuallyOpenedAccordions', JSON.stringify(Array.from(accordions)));
    } catch (error) {
      console.warn('Failed to save manually opened accordions to localStorage:', error);
    }
  };

  // Track which accordions were manually opened (persistent across page reloads)
  const [manuallyOpenedAccordions, setManuallyOpenedAccordions] = useState<Set<string>>(
    loadManuallyOpenedAccordions,
  );

  // Accordion state management - initialize with manually opened accordions
  const [accordionStates, setAccordionStates] = useState<{ [key: string]: boolean }>(() => {
    const initialState = {
      '01.01 Accessories': false,
      '01.02 Suit Group': false,
      '01.03 Dress Group': false,
      '01.04 Knitwear': false,
      '01.05 Coat Group / 01.Coats, half-coats, raincoats': false,
      '01.05 Coat Group / 02.Jackets, insulated coats': false,
      '01.05 Coat Group / 03.Overalls, semi-overalls, insulated suits, ski suits': false,
      '01.05 Coat Group / 04. Sports jackets, summer, jeans, demi-season': false,
      '01.06 Miscellaneous': false,
      '01.07 Headwear': false,
    };

    // Set manually opened accordions to true
    const persistentAccordions = loadManuallyOpenedAccordions();
    persistentAccordions.forEach((accordion) => {
      if (accordion in initialState) {
        initialState[accordion as keyof typeof initialState] = true;
      }
    });

    return initialState;
  });

  // Handle search input with debouncing
  const handleSearchChange = (value: string) => {
    setSearch(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is empty, apply immediately
    if (!value.trim()) {
      setActiveSearch('');
      return;
    }

    // If timer is disabled, apply search immediately
    if (!ENABLE_SEARCH_TIMER) {
      setActiveSearch(value);
      return;
    }

    // Set timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setActiveSearch(value);
    }, SEARCH_DEBOUNCE_DELAY);
  };

  // Handle Enter key press for immediate search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setActiveSearch(search);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Handle accordion toggle
  const handleAccordionToggle = (groupKey: string) => {
    setAccordionStates((prev) => {
      const newState = { ...prev, [groupKey]: !prev[groupKey] };

      // Update manually opened accordions
      const newManuallyOpened = new Set(manuallyOpenedAccordions);
      if (newState[groupKey]) {
        // Accordion is being opened - mark as manually opened
        newManuallyOpened.add(groupKey);
      } else {
        // Accordion is being closed - remove from manually opened
        newManuallyOpened.delete(groupKey);
      }

      // Save to localStorage immediately
      saveManuallyOpenedAccordions(newManuallyOpened);

      // Update state after saving
      setManuallyOpenedAccordions(newManuallyOpened);

      return newState;
    });
  }; // Handle product selection - mark accordion as manually opened if a product is selected from it
  const handleProductSelect = (
    service: { id: string; name: string; price: number },
    group: string,
  ) => {
    // If this accordion was opened due to search, mark it as manually opened now
    console.log('Handling product select for service:', service);
    console.log('Current manually opened accordions:', manuallyOpenedAccordions);
    console.log('Current accordion states:', accordionStates);
    console.log('Group:', group);
    if (!manuallyOpenedAccordions.has(group) && !accordionStates[group]) {
      const newManuallyOpened = new Set(manuallyOpenedAccordions);
      newManuallyOpened.add(group);
      console.log('Manually opening accordion:', group);
      console.log('New manually opened accordions:', newManuallyOpened);
      // Save to localStorage immediately and synchronously
      saveManuallyOpenedAccordions(newManuallyOpened);

      // Update state after saving
      setManuallyOpenedAccordions(newManuallyOpened);
    }

    setTempServiceInfo({
      id: service.id,
      name: service.name,
      price: service.price || 0,
      group: group,
    });
    navigate('service');
  };
  // Filtered groups and accordion states based on search
  const { filteredGroups, finalAccordionStates } = useMemo(() => {
    if (!activeSearch.trim()) {
      // No search: show all groups, use current accordion states (which include manually opened ones)
      return {
        filteredGroups: serviceGroups,
        finalAccordionStates: accordionStates,
      };
    }

    const searchLower = activeSearch.toLowerCase().trim();
    const manuallyOpenedList = Array.from(manuallyOpenedAccordions);

    // During search, keep manually opened accordions open and search within them first
    if (manuallyOpenedList.length > 0) {
      // Search in manually opened accordions
      const manuallyOpenedFiltered = serviceGroups
        .filter((group) => manuallyOpenedList.includes(group.group))
        .map((group) => ({
          ...group,
          services: group.services.filter((service) =>
            service.name.toLowerCase().includes(searchLower),
          ),
        }))
        .filter((group) => group.services.length > 0);

      // Search in other accordions too
      const otherFiltered = serviceGroups
        .filter((group) => !manuallyOpenedList.includes(group.group))
        .map((group) => ({
          ...group,
          services: group.services.filter((service) =>
            service.name.toLowerCase().includes(searchLower),
          ),
        }))
        .filter((group) => group.services.length > 0);

      const allFiltered = [...manuallyOpenedFiltered, ...otherFiltered];

      // Create accordion states: keep manually opened ones open, open others with search results
      const searchAccordionStates = { ...accordionStates };

      // Close all non-manually opened accordions first
      Object.keys(searchAccordionStates).forEach((key) => {
        if (!manuallyOpenedList.includes(key)) {
          searchAccordionStates[key] = false;
        }
      });

      // Open accordions that have search results (but weren't manually opened)
      otherFiltered.forEach((group) => {
        searchAccordionStates[group.group] = true;
      });

      return {
        filteredGroups: allFiltered,
        finalAccordionStates: searchAccordionStates,
      };
    }

    // No manually opened accordions: search across all and open those with matches
    const filtered = serviceGroups
      .map((group) => ({
        ...group,
        services: group.services.filter((service) =>
          service.name.toLowerCase().includes(searchLower),
        ),
      }))
      .filter((group) => group.services.length > 0);

    // Create accordion states that open groups with search results
    const searchAccordionStates = { ...accordionStates };
    Object.keys(searchAccordionStates).forEach((key) => {
      searchAccordionStates[key] = false;
    });
    filtered.forEach((group) => {
      searchAccordionStates[group.group] = true;
    });

    return {
      filteredGroups: filtered,
      finalAccordionStates: searchAccordionStates,
    };
  }, [activeSearch, accordionStates, manuallyOpenedAccordions]);

  const handleNext = () => {
    navigate('/create-order/5');
  };
  return (
    <div className="flex flex-col w-full h-full relative gap-2">
      <div className="bg-white rounded-2xl flex gap-6 items-center justify-between p-4 px-6">
        <h1>Services</h1>
        <Button
          label="Next"
          onClick={handleNext}
          variant="tertiary"
          size="medium"
          className="flex-shrink-0"
          disabled={data.services.length === 0}
        />
      </div>{' '}
      <div className="bg-white rounded-2xl flex w-full flex-col py-4 px-6 relative">
        <Input
          placeholder="Search for a service (press Enter or wait 1 sec)"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          wrapperClassName="flex-1"
          iconLeft={<SearchIcon className="w-6 h-6" />}
          inputClassName="w-full min-h-[50px]"
          inputWrapperClassName="w-full"
          maxLength={100}
        />
      </div>
      <div className="flex flex-1 gap-2">
        <div className="bg-white rounded-2xl flex-col flex-1 py-4 px-6 relative">
          {' '}
          <div className="w-full flex flex-col gap-4">
            <span className="text-md font-semibold">01.Textile products</span>
            {filteredGroups.length === 0 && activeSearch.trim() ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <span>No services found for "{activeSearch}"</span>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Accordion
                  key={group.group}
                  title={group.title}
                  isOpen={finalAccordionStates[group.group]}
                  setIsOpen={() => handleAccordionToggle(group.group)}
                >
                  <div className="flex gap-2 flex-wrap">
                    {' '}
                    {group.services.map((service) => (
                      <ProductCard
                        product={service}
                        key={service.id}
                        onClick={() => handleProductSelect(service, group.group)}
                      />
                    ))}
                  </div>
                </Accordion>
              ))
            )}
          </div>
          <div className="divider-h my-6" />
          {/* <span className="text-md font-semibold">02. Матрац</span> */}
        </div>
        {data.services.length > 0 && (
          <div className="bg-white rounded-2xl flex flex-col gap-2 w-[419px] shrink-0 py-4 px-6 relative overflow-y-auto scrollbar-small">
            {data.services.map((service, index) => (
              <Checkbox key={index}>
                <div className="p-4 rounded-lg flex flex-col border border-[#EFF1F6]">
                  <Accordion
                    header={
                      <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 rounded-lg bg-gray-accent text-base text-black">
                            {service.quantity}
                          </span>
                          <span className="text-base font-semibold">
                            {service.name.split(' ')[0]}
                          </span>
                        </div>
                        <span>{'№ [0] 10100' + index}</span>
                      </div>
                    }
                  >
                    <div className="pt-4 flex flex-col gap-2">
                      <span>Group: {service.group || ''}</span>
                      <span>Unit of change: pcs.</span>
                      <div className="divider-h" />
                      <span>Price: {service.priceInput}</span>
                      <span>Quantity: {service.quantity}</span>
                      <span>Coefficient: {service.coefficient}</span>
                      <span>Discount: {service.discount}%</span>
                      <div className="divider-h" />
                      <span>Current warehouse: Test</span>
                    </div>
                  </Accordion>
                </div>
              </Checkbox>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
