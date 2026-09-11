"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { CartLine } from "./cart-provider";
import { useCart } from "./cart-provider";

type PayPalEnvironment = "sandbox" | "live";
type PayPalOrderData = { orderId: string };
type CheckoutIssue = { code: string; title: string; detail: string; action: string };
type PayPalSDK = {
  createInstance: (config: { clientId: string; components: string[]; pageType: "checkout" }) => Promise<{
    findEligibleMethods: (options: { currencyCode: "USD" }) => Promise<{ isEligible: (method: string) => boolean }>;
    createPayPalOneTimePaymentSession: (callbacks: {
      onApprove: (data: PayPalOrderData) => Promise<unknown>;
      onCancel: () => void;
      onError: () => void;
    }) => {
      start: (options: { presentationMode: "auto" }, order: Promise<{ orderId: string }>) => Promise<void>;
    };
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

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      const error = new Error(message) as Error & { code?: string };
      error.code = "PAYPAL_SDK_LOAD_FAILED";
      reject(error);
    }, milliseconds);

    promise.then((value) => {
      window.clearTimeout(timeoutId);
      resolve(value);
    }, (error) => {
      window.clearTimeout(timeoutId);
      reject(error);
    });
  });
}

function describeIssue(code: string, detail: string): CheckoutIssue {
  if (code === "PAYPAL_CONFIG_MISSING") {
    return {
      code,
      title: "PayPal is not configured",
      detail,
      action: "Add all three PayPal variables to this deployment, then redeploy the site.",
    };
  }
  if (code === "PAYPAL_INVALID_CREDENTIALS") {
    return {
      code,
      title: "PayPal credentials were rejected",
      detail,
      action: "Replace them with a matching active Client ID and Secret from the same PayPal REST app.",
    };
  }
  if (code === "PAYPAL_NOT_ELIGIBLE") {
    return {
      code,
      title: "PayPal is unavailable here",
      detail,
      action: "Try another browser or location, or contact the shop for another way to pay.",
    };
  }
  if (code === "PAYPAL_SDK_LOAD_FAILED") {
    return {
      code,
      title: "PayPal could not load",
      detail,
      action: "Check the connection or content blocker, then refresh this page.",
    };
  }
  return {
    code,
    title: "PayPal connection failed",
    detail,
    action: "No payment was attempted. Retry the connection or contact the shop.",
  };
}

export default function PayPalCheckout({
  environment,
  clientId,
  items,
}: {
  environment: PayPalEnvironment;
  clientId: string;
  items: CartLine[];
}) {
  const router = useRouter();
  const { clearCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [issue, setIssue] = useState<CheckoutIssue | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const cartKey = useMemo(() => JSON.stringify(items), [items]);
  const sdkSource = environment === "live"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let button: HTMLElement | null = null;
    let clickHandler: (() => Promise<void>) | null = null;

    async function mountButton() {
      try {
        setStatus("loading");
        setIssue(null);
        for (let attempt = 0; attempt < 120 && !window.paypal; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 125));
        }
        if (!window.paypal) {
          const error = new Error("The PayPal checkout script loaded but did not finish initializing.") as Error & { code?: string };
          error.code = "PAYPAL_SDK_LOAD_FAILED";
          throw error;
        }
        if (!clientId) {
          const error = new Error("The PayPal Client ID is missing from this deployment.") as Error & { code?: string };
          error.code = "PAYPAL_CONFIG_MISSING";
          throw error;
        }
        const sdk = await withTimeout(
          window.paypal.createInstance({
            clientId,
            components: ["paypal-payments"],
            pageType: "checkout",
          }),
          12_000,
          "PayPal loaded but did not finish initializing the checkout.",
        );
        const eligibility = await withTimeout(
          sdk.findEligibleMethods({ currencyCode: "USD" }),
          8_000,
          "PayPal could not confirm checkout availability.",
        );
        if (!eligibility.isEligible("paypal")) {
          const error = new Error("PayPal did not mark this checkout as eligible for the current browser and location.") as Error & { code?: string };
          error.code = "PAYPAL_NOT_ELIGIBLE";
          throw error;
        }
        const session = sdk.createPayPalOneTimePaymentSession({
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
        const message = error instanceof Error ? error.message : "PayPal could not load.";
        const code = error && typeof error === "object" && "code" in error && typeof error.code === "string"
          ? error.code
          : "PAYPAL_CONNECTION_FAILED";
        setIssue(describeIssue(code, message));
        toast.error(message);
      }
    }

    mountButton();
    return () => {
      disposed = true;
      if (button && clickHandler) button.removeEventListener("click", clickHandler);
    };
  }, [cartKey, clearCart, clientId, items, retryKey, router]);

  function retryCheckout() {
    setStatus("loading");
    setIssue(null);
    setRetryKey((value) => value + 1);
  }

  function handleSdkError() {
    const nextIssue = describeIssue(
      "PAYPAL_SDK_LOAD_FAILED",
      "The PayPal checkout script did not load from PayPal.",
    );
    setStatus("error");
    setIssue(nextIssue);
    toast.error(nextIssue.title);
  }

  return (
    <div className="paypal-checkout">
      <Script src={sdkSource} strategy="afterInteractive" onError={handleSdkError} />
      <div className="paypal-checkout__heading"><span>Secure checkout</span><ShieldCheck size={19} /></div>
      <div
        className={`paypal-button-shell${status === "error" ? " is-hidden" : ""}${status !== "ready" && status !== "error" ? " is-loading" : ""}`}
        ref={containerRef}
        role="status"
        aria-live="polite"
        aria-label={status !== "ready" && status !== "error" ? "Connecting securely to PayPal" : "PayPal checkout ready"}
        aria-busy={status === "loading"}
      />
      {status === "error" && issue ? (
        <div className="paypal-diagnostic" role="alert" aria-live="assertive">
          <AlertTriangle size={24} />
          <div>
            <small>Checkout blocked</small>
            <strong>{issue.title}</strong>
            <p>{issue.detail}</p>
            <p>{issue.action}</p>
          </div>
          <code>{issue.code}</code>
          <button type="button" onClick={retryCheckout}><RefreshCw size={14} /> Retry PayPal</button>
        </div>
      ) : null}
      <p><LockKeyhole size={13} /> Payment is approved in PayPal and verified by the YG Cornhole server.</p>
    </div>
  );
}
