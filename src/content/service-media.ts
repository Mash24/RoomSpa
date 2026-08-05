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
 */
export const serviceMedia: Record<string, ServiceMedia> = {
  swedish: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Therapist pouring massage oil onto a guest’s back for Swedish massage",
    video: "/media/services/classic.mp4",
  },
  aromatherapy: {
    image: "/media/services/stills/v-oils.jpg",
    imageAlt: "Essential oil drop prepared for an aromatherapy massage",
    video: "/media/services/oils.mp4",
  },
  "hot-oil": {
    image: "/media/services/stills/v-hands.jpg",
    imageAlt: "Warm spa stones and oil work along the back",
    video: "/media/services/oils.mp4",
  },
  balinese: {
    image: "/media/services/stills/v-legs.jpg",
    imageAlt: "Palm pressure along the back during Balinese-style massage",
    video: "/media/services/classic.mp4",
  },
  oil: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Full-body oil massage with oil poured onto the back",
    video: "/media/services/oils.mp4",
  },
  "deep-tissue": {
    image: "/media/services/stills/v-deep.jpg",
    imageAlt: "Therapist applying firm pressure to the upper back",
    video: "/media/services/therapeutic.mp4",
  },
  thai: {
    image: "/media/services/stills/c-thai2.jpg",
    imageAlt: "Deep stretching and mobility work used in Thai-style sessions",
    video: "/media/services/therapeutic.mp4",
  },
  sports: {
    image: "/media/services/stills/v-manback.jpg",
    imageAlt: "Sports-style back massage for active recovery",
    video: "/media/services/therapeutic.mp4",
  },
  "foot-reflexology": {
    image: "/media/services/stills/p-handsbody.jpg",
    imageAlt: "Close-up of a professional foot massage and reflexology",
    video: "/media/services/therapeutic.mp4",
  },
  "head-shoulder": {
    image: "/media/services/stills/p-foot2.jpg",
    imageAlt: "Head, face, and neck massage for upper-body relief",
    video: "/media/services/therapeutic.mp4",
  },
  prenatal: {
    image: "/media/services/stills/v-prenatal.jpg",
    imageAlt: "Pregnancy-safe care — hands over a baby bump",
    video: "/media/services/therapeutic.mp4",
  },
  lymphatic: {
    image: "/media/services/stills/v-spa.jpg",
    imageAlt: "Gentle spa oils and linens for light lymphatic-style bodywork",
    video: "/media/services/oils.mp4",
  },
  couples: {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Side-by-side spa massage setting for two guests",
    video: "/media/services/shared.mp4",
  },
  "four-hands": {
    image: "/media/services/stills/c-man.jpg",
    imageAlt: "Two hands working a back massage in synchronized four-hands style",
    video: "/media/services/shared.mp4",
  },
  nuru: {
    image: "/media/services/stills/v-bath.jpg",
    imageAlt: "Private bath and warm-water setting prepared for Nuru massage",
    video: "/media/services/sensual.mp4",
  },
  "body-to-body": {
    image: "/media/services/stills/v-back.jpg",
    imageAlt: "Oil-covered back prepared for close-contact body-to-body massage",
    video: "/media/services/sensual.mp4",
  },
  yoni: {
    image: "/media/services/stills/c-thai.jpg",
    imageAlt: "Candlelit, private space prepared for consent-led Yoni massage",
    video: "/media/services/sensual.mp4",
  },
  lingam: {
    image: "/media/services/stills/v-manback.jpg",
    imageAlt: "Private male bodywork setting for consent-led Lingam massage",
    video: "/media/services/sensual.mp4",
  },
  tantric: {
    image: "/media/services/stills/c-thai.jpg",
    imageAlt: "Candlelight and calm atmosphere for tantric bodywork",
    video: "/media/services/sensual.mp4",
  },
  "couples-sensual": {
    image: "/media/services/stills/v-bath.jpg",
    imageAlt: "Private suite atmosphere for a couples sensual session",
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
