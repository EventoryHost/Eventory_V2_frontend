// src/app/(customer)/cart/page.tsx
import { getCartPageData } from "@/features/customer-cart/services/getCartPageData";
import CartPageContent from "@/features/customer-cart/components/CartPageContent";

export default async function CartPage() {
  const data = await getCartPageData();

  return <CartPageContent data={data} />;
}
