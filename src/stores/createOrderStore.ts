import { create } from 'zustand';
import { AppConfig } from '../hooks/useAppConfig';
import { useCreatedOrdersStore } from './createdOrders';
import { faker } from '@faker-js/faker/locale/zu_ZA';

// Utility function to generate default dates and times
const generateDefaultOrderValues = (config?: AppConfig, isFirst?: boolean) => {
  const now = new Date();

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format time as HH:MM
  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Calculate delivery date (today + 4 days)
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  console.log('IS FIRST', isFirst);

  return {
    receiveDate: formatDate(now),
    deliveryDate: formatDate(deliveryDate),
    receiveTime: formatTime(now),
    urgencyType: config?.defaultSettings?.urgencyType || 'normal',
    warehouseId: config?.defaultSettings?.warehouse?.id || '',
    deliveryWarehouseId: config?.defaultSettings?.deliveryWarehouse?.id || '',
    companyId: config?.defaultSettings?.company?.id || '',
    receiverId: config?.user?.id || '',
    tagNumber: isFirst ? '57437964351' : faker.string.numeric(11),
  };
};

export interface Service {
  id: string;
  name: string;
  image?: string;
  group: string;
  price?: number;
  quantity: number;
  coefficient: number;
  tagNumber: string;
  priceInput: number;
  discount: number;
  markup: string;
  description: string;
  extraOptions: string[];
  wear: string;
  conditions: string[];
  marking: string[];
  labelNote: string;
  photos?: string[];
  photoToken?: string;
  photoBlockList?: string[];
}

interface CreateOrderData {
  // selectedClientId: string | null;
  selectedClient: {
    id: string;
    name: string;
    debt?: number;
    phone: string;
    cardNumber?: string;
    discount?: string;
  };
  notificationSetting: null | 1 | 2 | 3;
  notificationNumber: string;
  isNotificationsAgree: boolean;
  isReceiptAgree: boolean;
  isAdvertAgree: boolean;

  // Step 2 data
  orderNumber: string;
  tagNumber: string;
  receiveDate: string;
  deliveryDate: string;
  deliveryTime?: string;
  receiveTime: string;
  deliveryWarehouseId: string;
  warehouseId: string;
  urgencyType: string;
  discount: string;
  discountScheme: string;
  receiverId: string;
  companyId: string;
  comment: string;
  isReturn: boolean;
  isPartnerOrder: boolean;

  services: Service[];
  selectedService: Partial<Service> | null;
  tempServiceInfo?: {
    id: string;
    name: string;
    price: number;
    group: string;
  };

  comments: {
    id?: string;
    userName: string;
    userId?: string;
    date: Date;
    text: string;
  }[];
}

interface CreateOrderStore {
  data: CreateOrderData;
  setOrderValue: <T>(path: string, value: T) => void;
  updateData: (updates: Partial<CreateOrderData>) => void;
  resetData: () => void;
  initializeWithDefaults: (config?: AppConfig) => void;
  setSelectedService: (service: Partial<Service> | null) => void;
  setTempServiceInfo: (info: CreateOrderData['tempServiceInfo']) => void;
  initiateSelectedService: () => void;
  addService: (service: Service) => void;
  clearSelectedService: () => void;
  addComment: (comment: CreateOrderData['comments'][number]) => void;
  addToPhotoBlockList: (photos: string[]) => void;
  removeFromPhotoBlockList: (photo: string) => void;
  clearPhotoBlockList: () => void;
}

const initialData: CreateOrderData = {
  selectedClient: {
    id: '',
    name: '',
    debt: undefined,
    phone: '',
    cardNumber: undefined,
    discount: undefined,
  },
  notificationSetting: null,
  notificationNumber: '',
  isNotificationsAgree: false,
  isReceiptAgree: false,
  isAdvertAgree: false,

  // Step 2 initial data
  orderNumber: '',
  tagNumber: '',
  receiveDate: '',
  deliveryDate: '',
  deliveryTime: '',
  receiveTime: '',
  warehouseId: '',
  deliveryWarehouseId: '',
  urgencyType: '',
  discount: '',
  discountScheme: '',
  receiverId: '',
  companyId: '',
  comment: '',
  isReturn: false,
  isPartnerOrder: false,

  services: [],
  selectedService: null,
  comments: [],
};

export const useCreateOrderStore = create<CreateOrderStore>((set) => {
  // const createSetter =
  //   <K extends keyof CreateOrderData>(key: K) =>
  //   (value: CreateOrderData[K]) =>
  //     set((state) => ({
  //       data: { ...state.data, [key]: value },
  //     }));

  return {
    data: initialData,
    setOrderValue: (path, value) =>
      set((state) => {
        const paths = path.split('.');
        const newData = { ...state.data };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: Record<string, any> = newData;

        for (let i = 0; i < paths.length - 1; i++) {
          if (current[paths[i]] && typeof current[paths[i]] === 'object') {
            current[paths[i]] = { ...current[paths[i]] };
          }
          current = current[paths[i]];
        }

        current[paths[paths.length - 1]] = value;
        return { data: newData };
      }),
    updateData: (updates) =>
      set((state) => ({
        data: { ...state.data, ...updates },
      })),
    resetData: () => set({ data: { ...initialData } }),
    initializeWithDefaults: (config?: AppConfig) => {
      // Get the current orders count at the time this function is called
      const { orders } = useCreatedOrdersStore.getState();
      const isFirst = orders.length === 0;
      const defaults = generateDefaultOrderValues(config, isFirst);
      set((state) => ({
        data: {
          ...state.data,
          ...defaults,
        },
      }));
    },
    initiateSelectedService: () => {
      // Initialize selectedService by creating a tagNumber
      // This is used when no service is pre-selected (fallback)
      const tagNumber = `123-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')}`;

      console.log('Generated fallback tag number:', tagNumber);
      set((state) => ({
        data: {
          ...state.data,
          selectedService: {
            id: '',
            name: '',
            image: '',
            group: '',
            price: 0,
            quantity: 1,
            coefficient: 1,
            tagNumber: tagNumber,
            priceInput: 0,
            discount: 0,
            markup: 'none',
            description: '',
            extraOptions: [],
            wear: '',
            conditions: [],
            marking: [],
            labelNote: '',
            photoBlockList: [],
          },
        },
      }));
    },
    setSelectedService: (service) =>
      set((state) => ({ data: { ...state.data, selectedService: service } })),
    addService: (service) =>
      set((state) => ({
        data: {
          ...state.data,
          services: [...state.data.services, service],
          selectedService: null,
        },
      })),
    setTempServiceInfo: (info) => {
      // Generate a tag number when setting temp service info
      const tagNumber = `00-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')}`;

      console.log('Generated tag number for service:', tagNumber);

      set((state) => ({
        data: {
          ...state.data,
          tempServiceInfo: info,
          selectedService: {
            id: info?.id || '',
            name: info?.name || '',
            image: '',
            group: info?.group || '',
            price: info?.price || 0,
            quantity: 1,
            coefficient: 1,
            tagNumber: tagNumber,
            priceInput: info?.price || 0,
            discount: 0,
            markup: 'none',
            description: '',
            extraOptions: [],
            wear: '',
            conditions: [],
            marking: [],
            labelNote: '',
          },
        },
      }));
    },
    clearSelectedService: () =>
      set((state) => ({ data: { ...state.data, selectedService: null } })),
    addComment: (comment) =>
      set((state) => ({
        data: {
          ...state.data,
          comments: [...state.data.comments, comment],
        },
      })),
    addToPhotoBlockList: (photos) =>
      set((state) => {
        if (!state.data.selectedService) return state;

        const currentBlockList = state.data.selectedService.photoBlockList || [];
        const newBlockList = [...currentBlockList, ...photos].filter(
          (photo, index, arr) => arr.indexOf(photo) === index, // Remove duplicates
        );

        return {
          data: {
            ...state.data,
            selectedService: {
              ...state.data.selectedService,
              photoBlockList: newBlockList,
            },
          },
        };
      }),
    removeFromPhotoBlockList: (photo) =>
      set((state) => {
        if (!state.data.selectedService) return state;

        const currentBlockList = state.data.selectedService.photoBlockList || [];
        const newBlockList = currentBlockList.filter((p) => p !== photo);

        return {
          data: {
            ...state.data,
            selectedService: {
              ...state.data.selectedService,
              photoBlockList: newBlockList,
            },
          },
        };
      }),
    clearPhotoBlockList: () =>
      set((state) => {
        if (!state.data.selectedService) return state;

        return {
          data: {
            ...state.data,
            selectedService: {
              ...state.data.selectedService,
              photoBlockList: [],
            },
          },
        };
      }),
  };
});

export const resetCreateOrderStore = () => {
  useCreateOrderStore.getState().resetData();
};
