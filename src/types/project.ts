export type ProjectType = 'Apartment' | 'Villa' | 'Farm Land' | 'Plot' | 'Other';

export type ProjectFilter =
  | 'All'
  | 'Apartments'
  | 'Villas'
  | 'Farm Lands'
  | 'Plots'
  | 'Other';

export type ProjectStatus = 'New Launch' | 'Under Construction' | 'Ready to Move';

export type AmenityIconName =
  | 'trees'
  | 'waves'
  | 'dumbbell'
  | 'shield'
  | 'zap'
  | 'car'
  | 'droplets'
  | 'sun'
  | 'footprints'
  | 'users';

export interface ProjectPhoto {
  url: string;
  isMain?: boolean;
}

export interface ProjectUnit {
  configuration: string;
  carpetArea?: string;
  builtUpArea?: string;
  price: string;
  floorPlanImage?: string;
}

export interface ProjectAmenity {
  label: string;
  icon: AmenityIconName;
  isCustom?: boolean;
}

export interface NearbyPlace {
  name: string;
  category?: string;
  travelTime: string;
}

export interface DeveloperInfo {
  name: string;
  yearEstablished?: string;
  projectsDelivered?: string;
  projectsOngoing?: string;
  shortDescription?: string;
  website?: string;
}

export interface ProjectFaq {
  question: string;
  answer: string;
}

export interface Project {
  id: string;
  name: string;
  developerName?: string;
  area?: string;
  city?: string;
  pincode?: string;
  location?: string;
  googleMapsUrl?: string;
  priceMin?: string;
  priceMax?: string;
  priceOnRequest?: boolean;
  pricePerSqFt?: string;
  startingPrice?: string;
  type: ProjectType;
  status: ProjectStatus;
  configurations?: string[];
  configuration?: string;
  parking?: string;
  floors?: string;
  totalUnits?: string;
  totalLandArea?: string;
  facing?: string;
  possessionDate?: string;
  reraNumber?: string;
  highlights?: string[];
  description?: string;
  photos?: ProjectPhoto[];
  mainPhoto?: string;
  unitTable?: ProjectUnit[];
  amenities?: ProjectAmenity[];
  nearbyPlaces?: NearbyPlace[];
  developer?: DeveloperInfo;
  faqs?: ProjectFaq[];
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const PROJECT_FILTERS: { label: ProjectFilter; matchType?: ProjectType }[] = [
  { label: 'All' },
  { label: 'Apartments', matchType: 'Apartment' },
  { label: 'Villas', matchType: 'Villa' },
  { label: 'Farm Lands', matchType: 'Farm Land' },
  { label: 'Plots', matchType: 'Plot' },
  { label: 'Other', matchType: 'Other' },
];

export const PRESET_AMENITIES: ProjectAmenity[] = [
  { label: 'Landscaped Gardens', icon: 'trees' },
  { label: 'Swimming Pool', icon: 'waves' },
  { label: 'Fitness Studio', icon: 'dumbbell' },
  { label: '24/7 Security', icon: 'shield' },
  { label: 'Power Backup', icon: 'zap' },
  { label: 'EV Charging & Parking', icon: 'car' },
  { label: 'Rainwater Harvesting', icon: 'droplets' },
  { label: 'Solar Lighting', icon: 'sun' },
  { label: 'Walking & Jogging Trails', icon: 'footprints' },
  { label: 'Clubhouse', icon: 'users' },
];

export const AMENITY_ICON_OPTIONS: { value: AmenityIconName; label: string }[] = [
  { value: 'trees', label: 'Greenery / Parks' },
  { value: 'waves', label: 'Pool / Water' },
  { value: 'dumbbell', label: 'Fitness / Gym' },
  { value: 'shield', label: 'Security' },
  { value: 'zap', label: 'Power / Utilities' },
  { value: 'car', label: 'Parking / EV' },
  { value: 'droplets', label: 'Water Conservation' },
  { value: 'sun', label: 'Solar / Outdoor' },
  { value: 'footprints', label: 'Trails / Sports' },
  { value: 'users', label: 'Clubhouse / Community' },
];
