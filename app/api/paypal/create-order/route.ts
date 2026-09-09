import { cents, priceCheckout } from "../../../lib/checkout";
import { PayPalRequestError, paypalRequest } from "../../../lib/paypal";

type CreatedOrder = { id: string; status: string };

export async function POST(request: Request) {
  try {
    const body = await request.json() as { items?: unknown };
    const cart = priceCheckout(body.items);
    const order = await paypalRequest<CreatedOrder>("/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": crypto.randomUUID() },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: "YG Cornhole order",
          amount: {
            currency_code: "USD",
            value: cents(cart.total),
            breakdown: {
              item_total: { currency_code: "USD", value: cents(cart.subtotal) },
              shipping: { currency_code: "USD", value: cents(cart.shipping) },
            },
          },
          items: cart.lines.map((line) => ({
            name: line.name.slice(0, 127),
            description: `${line.size} / ${line.color}`.slice(0, 127),
            sku: line.slug.slice(0, 127),
            category: "PHYSICAL_GOODS",
            quantity: String(line.quantity),
            unit_amount: { currency_code: "USD", value: cents(line.unitAmount) },
          })),
        }],
      }),
    });

    return Response.json({ id: order.id });
  } catch (error) {
    const status = error instanceof PayPalRequestError ? error.status : 400;
    const message = error instanceof Error ? error.message : "The PayPal order could not be created.";
    return Response.json({ error: message }, { status });
  }
}

