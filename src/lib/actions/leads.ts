"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LEAD_LIMITS } from "@/lib/stripe";
import type { Lead, LeadInput, LeadMotivation, LeadStatus } from "@/types/lead";

function readLeadInput(formData: FormData): LeadInput {
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
    address: (formData.get("address") as string)?.trim() ?? "",
    contact_name: text("contact_name"),
    phone: text("phone"),
    source: text("source"),
    status: (formData.get("status") as LeadStatus) || "new",
    motivation: (formData.get("motivation") as LeadMotivation) || null,
    follow_up_date: text("follow_up_date"),
    notes: text("notes"),
    arv: numeric("arv"),
    repair_estimate: numeric("repair_estimate"),
    wholesale_fee: numeric("wholesale_fee"),
  };
}

export async function createLead(formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const input = readLeadInput(formData);
  if (!input.address) {
    return { error: "Address is required" };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    subscription?.plan &&
    (subscription.status === "active" || subscription.status === "trialing")
  ) {
    const limit = PLAN_LEAD_LIMITS[subscription.plan as "starter" | "growth"];
    if (limit !== null) {
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count !== null && count >= limit) {
        return {
          error: `You've hit the ${limit}-lead limit on the Starter plan. Upgrade to Growth for unlimited leads.`,
        };
      }
    }
  }

  const { error } = await supabase
    .from("leads")
    .insert({ ...input, user_id: user.id });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateLead(
  id: string,
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const input = readLeadInput(formData);

  if (!input.address) {
    return { error: "Address is required" };
  }

  const { error } = await supabase.from("leads").update(input).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteLead(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function uploadLeadPhoto(
  leadId: string,
  formData: FormData,
): Promise<{ error: string | null; url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Please choose an image file" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${leadId}/photo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("lead-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("lead-photos").getPublicUrl(path);

  // Bust any cached copy of a previously uploaded photo at the same path.
  const bustedUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("leads")
    .update({ photo_url: bustedUrl })
    .eq("id", leadId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/dashboard");
  return { error: null, url: bustedUrl };
}

export async function removeLeadPhoto(
  leadId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ photo_url: null })
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
