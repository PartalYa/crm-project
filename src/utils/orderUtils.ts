import { useCreateOrderStore } from '../stores/createOrderStore';
import {
  useCreatedOrdersStore,
  convertToCreatedOrder,
  CreatedOrder,
} from '../stores/createdOrders';
import { OrderData } from '../data/mockOrderData';
import { companies, receivers } from '../data/mockDropDowns';

// Utility function to save an order from createOrderStore to createdOrdersStore
export const saveOrderFromCreateStore = (
  warehouseName?: string,
  companyName?: string,
): string | null => {
  const createOrderData = useCreateOrderStore.getState().data;
  const { addOrder } = useCreatedOrdersStore.getState();

  // Validate required fields
  if (!createOrderData.orderNumber) {
    console.error('Order number is required');
    return null;
  }

  if (!createOrderData.selectedClient.id || !createOrderData.selectedClient.name) {
    console.error('Client information is required');
    return null;
  }

  if (createOrderData.services.length === 0) {
    console.error('At least one service is required');
    return null;
  }

  try {
    // Convert create order data to created order
    const createdOrder = convertToCreatedOrder(createOrderData, warehouseName, companyName);

    // Add to created orders store
    addOrder(createdOrder);

    console.log('Order saved successfully:', createdOrder.id);
    return createdOrder.id;
  } catch (error) {
    console.error('Error saving order:', error);
    return null;
  }
};

// Utility function to generate a unique order number
export const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `${year}${month}${day}-${random}`;
};

// Utility function to get orders statistics
export const getOrdersStatistics = () => {
  const { orders } = useCreatedOrdersStore.getState();

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === 1).length,
    processing: orders.filter((order) => order.status === 2).length,
    completed: orders.filter((order) => order.status === 3).length,
    totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageAmount:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length
        : 0,
    totalItems: orders.reduce((sum, order) => sum + order.itemsCount, 0),
  };

  return stats;
};

// Utility function to get recent orders (last 10)
export const getRecentOrders = () => {
  const { orders } = useCreatedOrdersStore.getState();

  return orders
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 10);
};

// Utility function to search orders
export const searchOrders = (searchTerm: string) => {
  const { orders } = useCreatedOrdersStore.getState();

  if (!searchTerm.trim()) return orders;

  const term = searchTerm.toLowerCase();

  return orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(term) ||
      order.client.name.toLowerCase().includes(term) ||
      order.client.phone.includes(term) ||
      order.tag.toLowerCase().includes(term) ||
      order.comment.toLowerCase().includes(term) ||
      order.services.some(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          service.tagNumber.toLowerCase().includes(term),
      ),
  );
};

// Utility function to convert CreatedOrder to OrderData (table format)
export const convertOrderToTable = (createdOrder: CreatedOrder): OrderData => {
  const company = companies.find((c) => c.value === createdOrder.company) || {
    label: "John's Supplies Ltd.",
  };
  console.log(createdOrder.company, 'company', company);
  //   const receiver = receivers.find((r) => r.id === createdOrder.receiver) || {
  //     label: 'Unknown Receiver',
  //   };

  return {
    id: createdOrder.id,
    orderNumber: createdOrder.orderNumber,
    receiver: createdOrder.receiver,
    status: createdOrder.status,
    warehouse: 'Main Warehouse',
    company: company.label,
    client: createdOrder.client.name,
    createdDate: createdOrder.createdDate,
    updatedDate: createdOrder.updatedDate,
    amount: createdOrder.amount,
    priceList: 'VIP',
    items: createdOrder.items,
    weight: createdOrder.weight,
    isOutbound: createdOrder.isOutbound,
    hasPhotos: createdOrder.hasPhotos,
    tag: createdOrder.tag,
    notes: createdOrder.notes,
  };
};
