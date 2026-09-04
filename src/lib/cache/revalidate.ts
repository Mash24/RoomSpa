import { revalidateTag } from "next/cache";

export function revalidatePublicCatalog() {
  revalidateTag("catalog", "max");
}

export function revalidatePublicTherapists() {
  revalidateTag("therapists", "max");
}

export function revalidatePublicBlog() {
  revalidateTag("blog", "max");
}

export function revalidatePublicReviews() {
  revalidateTag("reviews", "max");
}
