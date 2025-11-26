import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service } from './createOrderStore';

// Interface for a created order (simplified from CreateOrderData)
export interface CreatedOrder {
  id: string;
  orderNumber: string;
  tagNumber: string; // Unique tag number for the order
  status: 1 | 2 | 3; // 1: pending, 2: processing, 3: completed
  createdDate: Date;
  updatedDate: Date;

  // Client information
  client: {
    id: string;
    name: string;
    phone: string;
    cardNumber?: string;
    debt?: number;
    discount?: string;
  };

  // Order details
  receiveDate: string;
  deliveryDate: string;
  receiveTime: string;
  deliveryTime?: string;
  warehouseId: string;
  deliveryWarehouseId: string;
  urgencyType: string;
  discount: string;
  discountScheme: string;
  receiverId: string;
  companyId: string;
  comment: string;
  isReturn: boolean;
  isPartnerOrder: boolean;

  // Services and pricing
  services: Service[];
  totalAmount: number;
  itemsCount: number;

  // Notification settings
  notificationSetting: null | 1 | 2 | 3;
  notificationNumber: string;
  isNotificationsAgree: boolean;
  isReceiptAgree: boolean;
  isAdvertAgree: boolean;

  // Additional metadata
  comments: {
    id?: string;
    userName: string;
    userId?: string;
    date: Date;
    text: string;
  }[];

  // For compatibility with OrderData interface
  receiver: string; // Maps to client.name
  warehouse: string; // Maps to warehouse name (will need to be resolved)
  company: string; // Maps to company name (will need to be resolved)
  amount: number; // Maps to totalAmount
  priceList: string; // Default or resolved from settings
  items: number; // Maps to itemsCount
  weight: number; // Calculated from services
  isOutbound: boolean; // Calculated or set based on delivery type
  hasPhotos: boolean; // Calculated from services photos
  tag: string; // Primary service tag or generated
  notes?: string; // Maps to comment
}

interface CreatedOrdersStore {
  orders: CreatedOrder[];
  addOrder: (order: CreatedOrder) => void;
  updateOrder: (id: string, updates: Partial<CreatedOrder>) => void;
  removeOrder: (id: string) => void;
  getOrderById: (id: string) => CreatedOrder | undefined;
  getOrdersByClient: (clientId: string) => CreatedOrder[];
  getOrdersByStatus: (status: 1 | 2 | 3) => CreatedOrder[];
  getTotalOrdersCount: () => number;
  getTotalAmount: () => number;
  clearAllOrders: () => void;
  markOrderAsCompleted: (id: string) => void;
  markOrderAsProcessing: (id: string) => void;
}

export const useCreatedOrdersStore = create<CreatedOrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders], // Add new orders at the beginning
        })),

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, ...updates, updatedDate: new Date() } : order,
          ),
        })),

      removeOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        })),

      getOrderById: (id) => {
        const state = get();
        return state.orders.find((order) => order.id === id);
      },

      getOrdersByClient: (clientId) => {
        const state = get();
        return state.orders.filter((order) => order.client.id === clientId);
      },

      getOrdersByStatus: (status) => {
        const state = get();
        return state.orders.filter((order) => order.status === status);
      },

      getTotalOrdersCount: () => {
        const state = get();
        return state.orders.length;
      },

      getTotalAmount: () => {
        const state = get();
        return state.orders.reduce((total, order) => total + order.totalAmount, 0);
      },

      clearAllOrders: () => set({ orders: [] }),

      markOrderAsCompleted: (id) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status: 3 as const, updatedDate: new Date() } : order,
          ),
        })),

      markOrderAsProcessing: (id) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status: 2 as const, updatedDate: new Date() } : order,
          ),
        })),
    }),
    {
      name: 'created-orders-store', // Storage key
      // Only persist essential data, exclude functions
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);

// Interface for the input data from createOrderStore
interface CreateOrderDataInput {
  selectedClient: {
    id: string;
    name: string;
    phone: string;
    cardNumber?: string;
    debt?: number;
    discount?: string;
  };
  orderNumber: string;
  tagNumber: string;
  receiveDate: string;
  deliveryDate: string;
  receiveTime: string;
  deliveryTime?: string;
  warehouseId: string;
  deliveryWarehouseId: string;
  urgencyType: string;
  discount: string;
  discountScheme: string;
  receiverId: string;
  companyId: string;
  comment: string;
  isReturn: boolean;
  isPartnerOrder: boolean;
  services: Service[];
  notificationSetting: null | 1 | 2 | 3;
  notificationNumber: string;
  isNotificationsAgree: boolean;
  isReceiptAgree: boolean;
  isAdvertAgree: boolean;
  comments: {
    id?: string;
    userName: string;
    userId?: string;
    date: Date;
    text: string;
  }[];
}

// Helper function to convert CreateOrderData to CreatedOrder
export const convertToCreatedOrder = (
  createOrderData: CreateOrderDataInput,
  warehouseName?: string,
  companyName?: string,
): CreatedOrder => {
  const id = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  // Calculate totals from services
  const totalAmount = createOrderData.services.reduce(
    (sum: number, service: Service) => sum + service.priceInput * service.quantity,
    0,
  );

  const itemsCount = createOrderData.services.reduce(
    (sum: number, service: Service) => sum + service.quantity,
    0,
  );

  // Calculate total weight (assuming each service has a default weight)
  const weight = createOrderData.services.reduce(
    (sum: number, service: Service) => sum + service.quantity * 1, // Default 1kg per item
    0,
  );

  // Check if any service has photos
  const hasPhotos = createOrderData.services.some(
    (service: Service) => service.photos && service.photos.length > 0,
  );

  // Get primary tag from first service or generate one
  const primaryTag = createOrderData.services[0]?.tagNumber || `${createOrderData.orderNumber}-001`;

  return {
    id,
    orderNumber: createOrderData.orderNumber,
    status: 1, // Default to pending
    tag: createOrderData.tagNumber,
    tagNumber: createOrderData.tagNumber || primaryTag,
    createdDate: now,
    updatedDate: now,

    client: createOrderData.selectedClient,

    receiveDate: createOrderData.receiveDate,
    deliveryDate: createOrderData.deliveryDate,
    receiveTime: createOrderData.receiveTime,
    deliveryTime: createOrderData.deliveryTime,
    warehouseId: createOrderData.warehouseId,
    deliveryWarehouseId: createOrderData.deliveryWarehouseId,
    urgencyType: createOrderData.urgencyType,
    discount: createOrderData.discount,
    discountScheme: createOrderData.discountScheme,
    receiverId: createOrderData.receiverId,
    companyId: createOrderData.companyId,
    comment: createOrderData.comment,
    isReturn: createOrderData.isReturn,
    isPartnerOrder: createOrderData.isPartnerOrder,

    services: createOrderData.services,
    totalAmount,
    itemsCount,

    notificationSetting: createOrderData.notificationSetting,
    notificationNumber: createOrderData.notificationNumber,
    isNotificationsAgree: createOrderData.isNotificationsAgree,
    isReceiptAgree: createOrderData.isReceiptAgree,
    isAdvertAgree: createOrderData.isAdvertAgree,

    comments: createOrderData.comments,

    // OrderData compatibility fields
    receiver: createOrderData.selectedClient.name,
    warehouse: warehouseName || 'Unknown Warehouse',
    company: companyName || "John's Supplies Ltd.",
    amount: totalAmount,
    priceList: 'Default', // Could be resolved from settings
    items: itemsCount,
    weight,
    isOutbound: false, // Could be determined by delivery type
    hasPhotos,
    notes: createOrderData.comment,
  };
};
