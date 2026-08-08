import type { ServiceCategoryId } from "@/content/services";

export type ServiceMedia = {
  image: string;
  imageAlt: string;
  /** Short looping clip that matches this service category of work */
  video: string;
};

/**
 * Local stills were visually verified before assignment.
 * Intimate services use tasteful atmosphere / matching bodywork context — never mismatched face-facial shots.
 * Alt text stays natural — not keyword dumps.
 */
export const serviceMedia: Record<string, ServiceMedia> = {
  swedish: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Therapist performing Swedish massage in a Chiang Mai hotel room",
    video: "/media/services/classic.mp4",
  },
  aromatherapy: {
    image: "/media/services/stills/v-oils.jpg",
    imageAlt: "Essential oils prepared for an aromatherapy massage",
    video: "/media/services/oils.mp4",
  },
  "hot-oil": {
    image: "/media/services/stills/v-hands.jpg",
    imageAlt: "Warm oil massage along the back",
    video: "/media/services/oils.mp4",
  },
  balinese: {
    image: "/media/services/stills/v-legs.jpg",
    imageAlt: "Balinese-style massage with palm pressure",
    video: "/media/services/classic.mp4",
  },
  oil: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Full-body oil massage in a private room",
    video: "/media/services/oils.mp4",
  },
  "deep-tissue": {
    image: "/media/services/stills/v-deep.jpg",
    imageAlt: "Deep tissue massage on the upper back",
    video: "/media/services/therapeutic.mp4",
  },
  thai: {
    image: "/media/services/stills/c-thai2.jpg",
    imageAlt: "Thai massage stretch work in a guest room",
    video: "/media/services/therapeutic.mp4",
  },
  sports: {
    image: "/media/services/stills/v-manback.jpg",
    imageAlt: "Sports massage for active recovery",
    video: "/media/services/therapeutic.mp4",
  },
  "foot-reflexology": {
    image: "/media/services/stills/p-handsbody.jpg",
    imageAlt: "Foot reflexology massage",
    video: "/media/services/therapeutic.mp4",
  },
  "head-shoulder": {
    image: "/media/services/stills/p-foot2.jpg",
    imageAlt: "Head, neck, and shoulder massage",
    video: "/media/services/therapeutic.mp4",
  },
  prenatal: {
    image: "/media/services/stills/v-prenatal.jpg",
    imageAlt: "Prenatal massage with pregnancy-safe positioning",
    video: "/media/services/therapeutic.mp4",
  },
  lymphatic: {
    image: "/media/services/stills/v-spa.jpg",
    imageAlt: "Light lymphatic drainage massage setup",
    video: "/media/services/oils.mp4",
  },
  couples: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Couples massage setup in a private room",
    video: "/media/services/shared.mp4",
  },
  "four-hands": {
    image: "/media/services/stills/c-man.jpg",
    imageAlt: "Four-hands massage with synchronized therapists",
    video: "/media/services/shared.mp4",
  },
  nuru: {
    image: "/media/services/stills/v-bath.jpg",
    imageAlt: "Private setting prepared for Nuru massage",
    video: "/media/services/sensual.mp4",
  },
  "body-to-body": {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Body-to-body oil massage setting",
    video: "/media/services/sensual.mp4",
  },
  yoni: {
    image: "/media/services/stills/c-thai.jpg",
    imageAlt: "Private candlelit space for consent-led Yoni massage",
    video: "/media/services/sensual.mp4",
  },
  lingam: {
    image: "/media/services/stills/v-manback.jpg",
    imageAlt: "Private setting for consent-led Lingam massage",
    video: "/media/services/sensual.mp4",
  },
  tantric: {
    image: "/media/services/stills/c-thai.jpg",
    imageAlt: "Calm private space for tantric massage",
    video: "/media/services/sensual.mp4",
  },
  "couples-sensual": {
    image: "/media/services/stills/v-bath.jpg",
    imageAlt: "Private suite prepared for a couples sensual session",
    video: "/media/services/shared.mp4",
  },
};

export const categoryMedia: Record<
  ServiceCategoryId,
  { video: string; poster: string; caption: string }
> = {
  classic: {
    video: "/media/services/classic.mp4",
    poster: "/media/services/stills/v-back.jpg",
    caption: "Classic oil and relaxation massage",
  },
  therapeutic: {
    video: "/media/services/therapeutic.mp4",
    poster: "/media/services/stills/v-deep.jpg",
    caption: "Therapeutic pressure and recovery work",
  },
  shared: {
    video: "/media/services/shared.mp4",
    poster: "/media/services/stills/v-back.jpg",
    caption: "Sessions for two",
  },
  sensual: {
    video: "/media/services/sensual.mp4",
    poster: "/media/services/stills/v-bath.jpg",
    caption: "Private sensual and tantric bodywork",
  },
};

export const servicesIntroVideo = {
  src: "/media/services/intro.mp4",
  poster: "/media/services/stills/v-hands.jpg",
};

export function getServiceMedia(slug: string): ServiceMedia {
  return (
    serviceMedia[slug] ?? {
      image: "/media/services/stills/v-spa.jpg",
      imageAlt: "RoomSpa in-room massage setting",
      video: "/media/services/classic.mp4",
    }
  );
}
