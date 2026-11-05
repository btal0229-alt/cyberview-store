import { Order, Tenant } from '../types';

/**
 * Exports completed orders to a standard CSV file formatted with UTF-8 BOM
 * ensuring full Arabic character support in Microsoft Excel and spreadsheet tools.
 */
export function exportCompletedOrdersToCSV(orders: Order[], tenant: Tenant): boolean {
  const completedOrders = orders.filter(o => o.status === 'delivered');

  if (completedOrders.length === 0) {
    return false;
  }

  // CSV Headers in Arabic
  const headers = [
    'رقم الطلب',
    'اسم العميل',
    'رقم الجوال',
    'تاريخ الطلب',
    'نوع الطلب',
    'العنوان',
    'تفاصيل الوجبات',
    'عدد الأصناف',
    'المبلغ الإجمالي (ر.س)',
    'حالة الطلب'
  ];

  // Helper to escape CSV cell content
  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Convert each order to a CSV row
  const rows = completedOrders.map(order => {
    const itemsDescription = order.items
      .map(item => `${item.productName} (الكمية: ${item.quantity} - السعر: ${item.unitPrice} ر.س)`)
      .join(' | ');

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryText = order.deliveryType === 'delivery' ? 'توصيل منزلي' : 'استلام من المطبخ';
    const statusText = 'مكتمل ومُسلّم';

    return [
      escapeCsv(order.id),
      escapeCsv(order.customerName),
      escapeCsv(order.customerPhone),
      escapeCsv(order.createdAt),
      escapeCsv(deliveryText),
      escapeCsv(order.address || '-'),
      escapeCsv(itemsDescription),
      escapeCsv(totalItems),
      escapeCsv(order.totalAmount),
      escapeCsv(statusText)
    ].join(',');
  });

  // Calculate totals summary row
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = completedOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );

  const summaryRow = [
    escapeCsv('الإجمالي النهائي'),
    escapeCsv(`عدد الطلبات: ${completedOrders.length}`),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(''),
    escapeCsv(`إجمالي الوجبات المباعة: ${totalItemsSold}`),
    escapeCsv(totalRevenue),
    escapeCsv('')
  ].join(',');

  // UTF-8 BOM (\uFEFF) ensures Excel opens Arabic text correctly without scrambled characters
  const csvContent = '\uFEFF' + [
    `# تقرير الطلبات المكتملة والمبيعات - ${tenant.name}`,
    `# تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')} | المعرّف: ${tenant.id}`,
    '',
    headers.join(','),
    ...rows,
    '',
    summaryRow
  ].join('\r\n');

  // Create Blob and trigger file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const formattedDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `تقرير_مبيعات_${tenant.id}_${formattedDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
