import { notFound } from "next/navigation";
import { getOrderWithItems } from "@/lib/pos";
import { getSettings } from "@/lib/settings";
import { ReceiptView } from "./receipt-view";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [data, settings] = await Promise.all([
    getOrderWithItems(code),
    getSettings(),
  ]);
  if (!data) notFound();

  const { order, items } = data;
  return (
    <ReceiptView
      venue={{
        name: settings.name,
        address: settings.address,
        whatsapp: settings.whatsapp,
      }}
      order={{
        code: order.code,
        createdAt: order.createdAt.toISOString(),
        customerName: order.customerName,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod,
        cashReceived: order.cashReceived,
      }}
      items={items.map((i) => ({
        name: i.nameSnapshot,
        price: i.priceSnapshot,
        qty: i.qty,
        lineTotal: i.lineTotal,
      }))}
    />
  );
}
