"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { CartLine } from "./cart-provider";
import { useCart } from "./cart-provider";

type PayPalEnvironment = "sandbox" | "live";
type PayPalOrderData = { orderId: string };
type PayPalSDK = {
  createInstance: (config: { clientId: string; components: string[] }) => Promise<{
    findEligibleMethods: () => Promise<{ isEligible: (method: string) => boolean }>;
    createPayPalOneTimePaymentSession: (callbacks: {
      onApprove: (data: PayPalOrderData) => Promise<unknown>;
      onCancel: () => void;
      onError: () => void;
    }) => Promise<{
      start: (options: { presentationMode: "auto" }, order: Promise<{ orderId: string }>) => Promise<void>;
    }>;
  }>;
};

declare global {
  interface Window { paypal?: PayPalSDK }
}

async function readJson(response: Response) {
  const data = await response.json() as { error?: string; id?: string; status?: string };
  if (!response.ok) throw new Error(data.error ?? "PayPal could not process the payment.");
  return data;
}

export default function PayPalCheckout({
  clientId,
  environment,
  items,
}: {
  clientId: string;
  environment: PayPalEnvironment;
  items: CartLine[];
}) {
  const router = useRouter();
  const { clearCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const cartKey = useMemo(() => JSON.stringify(items), [items]);
  const sdkSource = environment === "live"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";

  useEffect(() => {
    const container = containerRef.current;
    if (!sdkReady || !clientId || !container || !window.paypal) return;
    let disposed = false;
    let button: HTMLElement | null = null;
    let clickHandler: (() => Promise<void>) | null = null;

    async function mountButton() {
      try {
        setStatus("loading");
        const sdk = await window.paypal!.createInstance({ clientId, components: ["paypal-payments"] });
        const eligibility = await sdk.findEligibleMethods();
        if (!eligibility.isEligible("paypal")) throw new Error("PayPal is not available for this browser or location.");
        const session = await sdk.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const order = await readJson(response);
            if (order.status !== "COMPLETED" || !order.id) throw new Error("PayPal has not completed this payment.");
            toast.success("Payment completed. Your order is confirmed.");
            router.push(`/order-confirmation?order_id=${encodeURIComponent(order.id)}`);
            clearCart();
            return order;
          },
          onCancel: () => toast.info("PayPal checkout was cancelled. Your cart is unchanged."),
          onError: () => toast.error("PayPal could not complete the payment. Please try again."),
        });

        if (disposed || !containerRef.current) return;
        containerRef.current.replaceChildren();
        button = document.createElement("paypal-button");
        button.setAttribute("type", "pay");
        button.setAttribute("aria-label", "Pay securely with PayPal");
        clickHandler = async () => {
          try {
            const orderPromise = fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
            }).then(readJson).then((order) => {
              if (!order.id) throw new Error("PayPal did not return an order ID.");
              return { orderId: order.id };
            });
            await session.start({ presentationMode: "auto" }, orderPromise);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "PayPal could not start checkout.");
          }
        };
        button.addEventListener("click", clickHandler);
        containerRef.current.append(button);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        toast.error(error instanceof Error ? error.message : "PayPal could not load.");
      }
    }

    mountButton();
    return () => {
      disposed = true;
      if (button && clickHandler) button.removeEventListener("click", clickHandler);
    };
  }, [cartKey, clearCart, clientId, items, router, sdkReady]);

  if (!clientId) {
    return (
      <div className="paypal-config-note" role="status">
        <LockKeyhole size={18} />
        <div><strong>PayPal setup required</strong><span>Add the server environment variables to enable checkout.</span></div>
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      <Script src={sdkSource} strategy="afterInteractive" onReady={() => setSdkReady(true)} onError={() => setStatus("error")} />
      <div className="paypal-checkout__heading"><span>Secure checkout</span><ShieldCheck size={19} /></div>
      <div className="paypal-button-shell" ref={containerRef} aria-busy={status === "loading"}>
        {status !== "ready" && status !== "error" ? <p>Loading PayPal checkout…</p> : null}
        {status === "error" ? <p>PayPal is unavailable right now. Refresh the page or try again shortly.</p> : null}
      </div>
      <p><LockKeyhole size={13} /> Payment is approved in PayPal and verified by the YG Cornhole server.</p>
    </div>
  );
}
