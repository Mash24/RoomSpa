import type { ServiceCategoryId } from "@/content/services";

export type ServiceMedia = {
  image: string;
  imageAlt: string;
};

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Tasteful stock stills — swap for owned photography later. */
export const serviceMedia: Record<string, ServiceMedia> = {
  swedish: {
    image: u("photo-1544161515-4ab6ce6db874"),
    imageAlt: "Guest receiving a calm full-body Swedish massage",
  },
  aromatherapy: {
    image: u("photo-1515377905703-c4788e51af15"),
    imageAlt: "Essential oils prepared for an aromatherapy session",
  },
  "hot-oil": {
    image: u("photo-1600334089648-b0d9d70cba7f"),
    imageAlt: "Warm massage oil during a hot oil treatment",
  },
  balinese: {
    image: u("photo-1519823551278-64ac92734fb1"),
    imageAlt: "Calm spa atmosphere for Balinese-style massage",
  },
  oil: {
    image: u("photo-1540555700478-4be289fbecef"),
    imageAlt: "Oil massage in a private room setting",
  },
  "deep-tissue": {
    image: u("photo-1571019614242-c5c5dee9f50b"),
    imageAlt: "Focused therapeutic bodywork",
  },
  thai: {
    image: u("photo-1544367567-0f2fcb009e0b"),
    imageAlt: "Stretching and mobility-focused bodywork",
  },
  sports: {
    image: u("photo-1517836357463-d25dfeac3438"),
    imageAlt: "Active recovery and sports massage",
  },
  "foot-reflexology": {
    image: u("photo-1519415387720-a4affba0d4d5"),
    imageAlt: "Foot and lower-leg reflexology",
  },
  "head-shoulder": {
    image: u("photo-1596178060671-7a80dc8059ea"),
    imageAlt: "Head, neck and shoulder massage",
  },
  prenatal: {
    image: u("photo-1583416750470-965b2707b355"),
    imageAlt: "Comfort-focused prenatal massage setting",
  },
  lymphatic: {
    image: u("photo-1515377905703-c4788e51af15"),
    imageAlt: "Gentle lymphatic drainage bodywork",
  },
  couples: {
    image: u("photo-1529333166437-7750a6dd5a70"),
    imageAlt: "Shared private setting for couples massage",
  },
  "four-hands": {
    image: u("photo-1600334129128-685c5582fd35"),
    imageAlt: "Premium in-room setup for four-hands massage",
  },
  nuru: {
    image: u("photo-1540555700478-4be289fbecef"),
    imageAlt: "Private warm-oil setting for Nuru massage",
  },
  "body-to-body": {
    image: u("photo-1600334129128-685c5582fd35"),
    imageAlt: "Soft-lit private room for body-to-body massage",
  },
  yoni: {
    image: u("photo-1507652313519-d4e9174996dd"),
    imageAlt: "Calm candlelit space for consent-led tantric bodywork",
  },
  lingam: {
    image: u("photo-1512290923902-8a9f81dc236c"),
    imageAlt: "Quiet private setting for consent-led tantric bodywork",
  },
  tantric: {
    image: u("photo-1507652313519-d4e9174996dd"),
    imageAlt: "Soft lighting for tantric massage",
  },
  "couples-sensual": {
    image: u("photo-1529333166437-7750a6dd5a70"),
    imageAlt: "Private suite for a couples sensual session",
  },
};

export const categoryMedia: Record<
  ServiceCategoryId,
  { video: string; poster: string; caption: string }
> = {
  classic: {
    video: "/media/services/classic.mp4",
    poster: u("photo-1544161515-4ab6ce6db874", 1600),
    caption: "Classic relaxation, delivered in your room",
  },
  therapeutic: {
    video: "/media/services/therapeutic.mp4",
    poster: u("photo-1571019614242-c5c5dee9f50b", 1600),
    caption: "Targeted relief for travel fatigue and tension",
  },
  shared: {
    video: "/media/services/shared.mp4",
    poster: u("photo-1529333166437-7750a6dd5a70", 1600),
    caption: "Side-by-side sessions for two",
  },
  sensual: {
    video: "/media/services/sensual.mp4",
    poster: u("photo-1507652313519-d4e9174996dd", 1600),
    caption: "Private, consent-led sensual & tantric bodywork",
  },
};

export const servicesIntroVideo = {
  src: "/media/services/intro.mp4",
  poster: u("photo-1600334129128-685c5582fd35", 2000),
};

export function getServiceMedia(slug: string): ServiceMedia {
  return (
    serviceMedia[slug] ?? {
      image: u("photo-1600334129128-685c5582fd35"),
      imageAlt: "RoomSpa in-room massage setting",
    }
  );
}
