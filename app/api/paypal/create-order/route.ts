import { cents, priceCheckout } from "../../../lib/checkout";
import { PayPalRequestError, paypalRequest } from "../../../lib/paypal";

type CreatedOrder = { id: string; status: string };

type ShippingInput = {
  fullName?: unknown;
  email?: unknown;
  addressLine1?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  countryCode?: unknown;
};

function cleanShipping(raw: unknown) {
  if (raw === undefined) return undefined;
  if (!raw || typeof raw !== "object") throw new Error("Enter valid delivery details.");
  const shipping = raw as ShippingInput;
  const text = (value: unknown, label: string, maxLength: number) => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
      throw new Error(`Enter a valid ${label}.`);
    }
    return value.trim();
  };
  const email = text(shipping.email, "email address", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  const countryCode = text(shipping.countryCode, "country", 2).toUpperCase();
  if (!new Set(["US", "CA"]).has(countryCode)) throw new Error("Choose a supported delivery country.");
  const state = text(shipping.state, "state or province", 120).toUpperCase();
  const postalCode = text(shipping.postalCode, "postal code", 60).toUpperCase();

  if (countryCode === "US" && !/^[A-Z]{2}$/.test(state)) {
    throw new Error("Enter a 2-letter US state abbreviation, such as TX.");
  }
  if (countryCode === "US" && !/^\d{5}(?:-\d{4})?$/.test(postalCode)) {
    throw new Error("Enter a valid US ZIP code, such as 75001.");
  }
  if (countryCode === "CA" && !/^[A-Z]{2}$/.test(state)) {
    throw new Error("Enter a 2-letter Canadian province abbreviation, such as ON.");
  }
  if (countryCode === "CA" && !/^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/.test(postalCode)) {
    throw new Error("Enter a valid Canadian postal code, such as M5V 2T6.");
  }

  return {
    fullName: text(shipping.fullName, "full name", 300),
    email,
    addressLine1: text(shipping.addressLine1, "street address", 300),
    city: text(shipping.city, "city", 120),
    state,
    postalCode,
    countryCode,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { items?: unknown; shipping?: unknown };
    const cart = priceCheckout(body.items);
    const shipping = cleanShipping(body.shipping);
    const order = await paypalRequest<CreatedOrder>("/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": crypto.randomUUID() },
      body: JSON.stringify({
        intent: "CAPTURE",
        ...(shipping ? { payer: { email_address: shipping.email } } : {}),
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
          ...(shipping ? {
            shipping: {
              name: { full_name: shipping.fullName },
              address: {
                address_line_1: shipping.addressLine1,
                admin_area_2: shipping.city,
                admin_area_1: shipping.state,
                postal_code: shipping.postalCode,
                country_code: shipping.countryCode,
              },
            },
          } : {}),
        }],
      }),
    });

    return Response.json({ id: order.id });
  } catch (error) {
    const status = error instanceof PayPalRequestError ? error.status : 400;
    const message = error instanceof Error ? error.message : "The PayPal order could not be created.";
    const code = error instanceof PayPalRequestError ? error.code : "CHECKOUT_DETAILS_INVALID";
    return Response.json({ error: message, code }, { status });
  }
}
