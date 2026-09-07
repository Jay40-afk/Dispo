"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Buyer, BuyerInput } from "@/types/buyer";

function readBuyerInput(formData: FormData): BuyerInput {
  const numeric = (key: string) => {
    const raw = formData.get(key);
    if (!raw || raw === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };
  const text = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
  };

  return {
    name: (formData.get("name") as string)?.trim() ?? "",
    phone: text("phone"),
    email: text("email"),
    markets: text("markets"),
    price_min: numeric("price_min"),
    price_max: numeric("price_max"),
    property_types: text("property_types"),
    notes: text("notes"),
  };
}

export async function createBuyer(
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const input = readBuyerInput(formData);
  if (!input.name) {
    return { error: "Name is required" };
  }

  const { error } = await supabase
    .from("buyers")
    .insert({ ...input, user_id: user.id });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/buyers");
  return { error: null };
}

export async function updateBuyer(
  id: string,
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const input = readBuyerInput(formData);

  if (!input.name) {
    return { error: "Name is required" };
  }

  const { error } = await supabase.from("buyers").update(input).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/buyers");
  return { error: null };
}

export async function deleteBuyer(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("buyers").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/buyers");
  return { error: null };
}

export async function getBuyers(): Promise<Buyer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
