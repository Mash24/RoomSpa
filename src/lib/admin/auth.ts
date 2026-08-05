import { createClient } from "@/utils/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;

  return { userId: user.id, email: user.email };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, supabase: null, error: "Unauthorized" as const };
  }

  const supabase = await createClient();
  return { session, supabase, error: null };
}
