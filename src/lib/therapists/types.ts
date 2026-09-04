export type TherapistGender = "female" | "male" | "nonbinary" | "unspecified";

export type TherapistMediaType = "photo" | "video";

export type MediaApprovalStatus = "pending" | "approved" | "rejected";

export type PublicTherapistMedia = {
  id: string;
  url: string;
  type: TherapistMediaType;
  thumbnailUrl: string | null;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

/** @deprecated Use PublicTherapistMedia */
export type PublicTherapistPhoto = PublicTherapistMedia;

export type PublicTherapist = {
  id: string;
  slug: string;
  displayName: string;
  gender: TherapistGender;
  /** Computed from date_of_birth when showAge is true */
  age: number | null;
  height: string | null;
  weight: string | null;
  nationality: string | null;
  ethnicity: string | null;
  bio: string;
  languages: string[];
  yearsExperience: number | null;
  training: string | null;
  city: string;
  country: string;
  /** Province / state / county — public */
  region: string;
  /** Customer-facing summary e.g. "Usually available around Nimman, Old City" */
  areaSummary: string;
  /** Derived from ops eligibility — not a free-form admin toggle */
  verified: boolean;
  /** Show on /therapists gallery */
  showOnGallery?: boolean;
  acceptingBookings: boolean;
  featured: boolean;
  media: PublicTherapistMedia[];
  serviceSlugs: string[];
  serviceNames: string[];
  serviceAreaSlugs: string[];
  serviceAreaNames: string[];
  /** Approximate map pin — service-area centroid, not therapist home */
  mapLatitude: number | null;
  mapLongitude: number | null;
  /** Rounded distance when filtering by user coordinates */
  distanceKm?: number;
};

/** @deprecated Use serviceAreaSlugs */
export type PublicTherapistLegacy = PublicTherapist & {
  photos: PublicTherapistMedia[];
  coverageSlugs: string[];
  coverageNames: string[];
  areaLabel: string;
  latitude: number | null;
  longitude: number | null;
  serviceRadiusKm: number;
};

export type TherapistStatus =
  | "applicant"
  | "interviewed"
  | "skills_verified"
  | "trial"
  | "draft"
  | "active"
  | "fully_booked"
  | "temporarily_unavailable"
  | "on_leave"
  | "suspended"
  | "inactive";

export type ServiceQualification = {
  serviceId: string;
  claimed: boolean;
  tested: boolean;
  approved: boolean;
  active: boolean;
};

export type TherapistFilters = {
  serviceSlug?: string;
  coverageAreaSlug?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  /** Match therapists based in this city (browse), ignoring travel radius */
  city?: string;
  featured?: boolean;
  limit?: number;
  gender?: TherapistGender | "any";
  search?: string;
  /** Signature vs wellness gallery filter */
  experienceTier?: "signature" | "wellness" | "any";
};

export type AdminTherapistMedia = PublicTherapistMedia & {
  approvalStatus: MediaApprovalStatus;
};

export type AdminTherapistRow = {
  id: string;
  slug: string;
  displayName: string;
  gender: TherapistGender;
  dateOfBirth: string | null;
  heightCm: number | null;
  weightKg: number | null;
  nationality: string | null;
  ethnicity: string | null;
  bio: string;
  languages: string[];
  yearsExperience: number | null;
  training: string;
  showOnGallery: boolean;
  acceptingBookings: boolean;
  status: TherapistStatus;
  /** Derived for display; computed from ops state on read */
  verified: boolean;
  showAge: boolean;
  showHeight: boolean;
  showWeight: boolean;
  showEthnicity: boolean;
  showNationality: boolean;
  featured: boolean;
  sortOrder: number;
  phone: string | null;
  internalNotes: string;
  skillScore: number | null;
  professionalismScore: number | null;
  communicationScore: number | null;
  reliabilityScore: number | null;
  punctualityScore: number | null;
  feedbackScore: number | null;
  /** Internal — admin only */
  location: {
    city: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    serviceRadiusKm: number;
    publicAreaSummary: string;
  } | null;
  media: AdminTherapistMedia[];
  serviceIds: string[];
  serviceSlugs: string[];
  serviceQualifications: ServiceQualification[];
  serviceAreaIds: string[];
  serviceAreaSlugs: string[];
};
