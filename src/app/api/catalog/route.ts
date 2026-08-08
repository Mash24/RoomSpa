import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/catalog/public";

export const dynamic = "force-dynamic";

/** Public catalog for booking UI and client refreshes. */
export async function GET() {
  try {
    const services = await getPublicCatalog();
    return NextResponse.json(
      { services },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load catalog." },
      { status: 500 },
    );
  }
}
