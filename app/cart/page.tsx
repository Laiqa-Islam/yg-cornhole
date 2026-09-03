import type { Metadata } from "next";
import CartPage from "../ui/cart-page";
import SiteHeader from "../ui/site-header";
import StoreFooter from "../ui/store-footer";

export const metadata: Metadata = { title: "Your Cart | YG Cornhole" };

export default function Cart() {
  return <main className="store-page" id="main-content"><SiteHeader /><CartPage /><StoreFooter /></main>;
}
