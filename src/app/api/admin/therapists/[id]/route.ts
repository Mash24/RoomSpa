import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { scoreOrNull } from "@/lib/therapists/admin-ops";
import { therapistStatusFlags } from "@/lib/therapists/status";
import type { TherapistStatus } from "@/lib/therapists/types";

type RouteContext = { params: Promise<{ id: string }> };

function parseLanguages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.displayName != null) patch.display_name = String(body.displayName).trim();
  if (body.slug != null) patch.slug = String(body.slug).trim().toLowerCase();
  if (body.gender != null) patch.gender = body.gender;
  if (body.dateOfBirth !== undefined) patch.date_of_birth = body.dateOfBirth || null;
  if (body.heightCm !== undefined) patch.height_cm = body.heightCm != null && body.heightCm !== "" ? Number(body.heightCm) : null;
  if (body.weightKg !== undefined) patch.weight_kg = body.weightKg != null && body.weightKg !== "" ? Number(body.weightKg) : null;
  if (body.nationality !== undefined) patch.nationality = body.nationality || null;
  if (body.ethnicity != null) patch.ethnicity = String(body.ethnicity);
  if (body.bio != null) patch.bio = String(body.bio);
  if (body.languages !== undefined) patch.languages = parseLanguages(body.languages);
  if (body.yearsExperience !== undefined) {
    patch.years_experience =
      body.yearsExperience != null && body.yearsExperience !== ""
        ? Number(body.yearsExperience)
        : null;
  }
  if (body.training !== undefined) patch.training = String(body.training || "");
  if (body.acceptingBookings != null) patch.accepting_bookings = Boolean(body.acceptingBookings);
  if (body.showOnGallery != null) patch.show_on_gallery = Boolean(body.showOnGallery);
  if (body.internalNotes !== undefined) patch.internal_notes = String(body.internalNotes || "");
  if (body.phone !== undefined) patch.phone = body.phone || null;
  if (body.skillScore !== undefined) patch.skill_score = scoreOrNull(body.skillScore);
  if (body.professionalismScore !== undefined) patch.professionalism_score = scoreOrNull(body.professionalismScore);
  if (body.communicationScore !== undefined) patch.communication_score = scoreOrNull(body.communicationScore);
  if (body.reliabilityScore !== undefined) patch.reliability_score = scoreOrNull(body.reliabilityScore);
  if (body.punctualityScore !== undefined) patch.punctuality_score = scoreOrNull(body.punctualityScore);
  if (body.feedbackScore !== undefined) patch.feedback_score = scoreOrNull(body.feedbackScore);
  if (body.status != null) {
    const nextStatus = body.status as TherapistStatus;
    patch.status = nextStatus;
    Object.assign(patch, therapistStatusFlags(nextStatus));
  }
  if (body.isActive != null) {
    patch.is_active = Boolean(body.isActive);
    patch.status = body.isActive ? "active" : "inactive";
  }
  if (body.isBookable != null) patch.is_bookable = Boolean(body.isBookable);
  // verified is derived — ignore manual toggles
  if (body.showAge != null) patch.show_age = Boolean(body.showAge);
  if (body.showHeight != null) patch.show_height = Boolean(body.showHeight);
  if (body.showWeight != null) patch.show_weight = Boolean(body.showWeight);
  if (body.showEthnicity != null) patch.show_ethnicity = Boolean(body.showEthnicity);
  if (body.showNationality != null) patch.show_nationality = Boolean(body.showNationality);
  if (body.featured != null) patch.featured = Boolean(body.featured);
  if (body.sortOrder != null) patch.sort_order = Number(body.sortOrder);

  const { error: updateError } = await supabase.from("therapists").update(patch).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (
    body.photoUrls ||
    body.mediaUrls ||
    body.mediaApprovals ||
    body.primaryPhotoUrl ||
    body.serviceIds ||
    body.serviceQualifications ||
    body.serviceAreaIds ||
    body.coverageAreaIds ||
    body.location
  ) {
    const { syncRelations } = await import("../route");
    const relationError = await syncRelations(supabase, id, body);
    if (relationError) {
      return NextResponse.json({ error: relationError }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { error: updateError } = await supabase
    .from("therapists")
    .update({
      status: "inactive",
      is_active: false,
      is_bookable: false,
      accepting_bookings: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
