import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { OperationType, db, handleFirestoreError, storage } from '../lib/firebase';
import {
  DeveloperInfo,
  NearbyPlace,
  Project,
  ProjectAmenity,
  ProjectFaq,
  ProjectPhoto,
  ProjectUnit,
} from '../types/project';
import { compressImageFile } from '../utils/imageCompression';

export const PROJECTS_COLLECTION = 'projects';

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

function formatLocation(area?: string, city?: string, pincode?: string): string {
  const parts = [area?.trim(), city?.trim()].filter(Boolean) as string[];
  const base = parts.join(', ');
  if (pincode?.trim()) {
    return base ? `${base} - ${pincode.trim()}` : pincode.trim();
  }
  return base;
}

function deriveStartingPrice(input: ProjectInput): string | undefined {
  if (input.priceOnRequest) return 'On request';
  if (input.priceMin?.trim()) return `${input.priceMin.trim()} onwards`;
  if (input.startingPrice?.trim()) return input.startingPrice.trim();
  return undefined;
}

function sanitizeProjectPayload(
  input: ProjectInput,
  options: { isCreate: boolean }
): Record<string, unknown> {
  const photos: ProjectPhoto[] = (input.photos ?? [])
    .filter((p) => Boolean(p.url?.trim()))
    .slice(0, 25)
    .map((p) => ({
      url: p.url.trim(),
      ...(p.isMain ? { isMain: true } : {}),
    }));

  const mainPhotoUrl =
    photos.find((p) => p.isMain)?.url ??
    photos[0]?.url ??
    input.mainPhoto?.trim() ??
    '';

  const configurations = (input.configurations ?? [])
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 20);

  const location =
    formatLocation(input.area, input.city, input.pincode) ||
    input.location?.trim() ||
    '';

  const configurationSummary =
    configurations.length > 0
      ? configurations.join(', ').slice(0, 160)
      : input.configuration?.trim().slice(0, 160) ?? '';

  const payload: Record<string, unknown> = {
    name: input.name.trim().slice(0, 160),
    type: input.type,
    status: input.status,
    published: Boolean(input.published),
    updatedAt: serverTimestamp(),
  };

  if (options.isCreate) {
    payload.createdAt = serverTimestamp();
  }

  const optionalStrings: [string, string | undefined, number][] = [
    ['developerName', input.developerName ?? input.developer?.name, 160],
    ['area', input.area, 120],
    ['city', input.city, 120],
    ['pincode', input.pincode, 20],
    ['location', location, 260],
    ['googleMapsUrl', input.googleMapsUrl, 1000],
    ['priceMin', input.priceMin, 60],
    ['priceMax', input.priceMax, 60],
    ['pricePerSqFt', input.pricePerSqFt, 60],
    ['startingPrice', deriveStartingPrice(input), 80],
    ['configuration', configurationSummary, 160],
    ['parking', input.parking, 120],
    ['floors', input.floors, 120],
    ['totalUnits', input.totalUnits, 80],
    ['totalLandArea', input.totalLandArea, 120],
    ['facing', input.facing, 120],
    ['possessionDate', input.possessionDate, 120],
    ['reraNumber', input.reraNumber, 120],
    ['description', input.description, 5000],
    ['mainPhoto', mainPhotoUrl, 1000],
  ];

  for (const [key, val, maxLen] of optionalStrings) {
    if (val && val.trim()) {
      payload[key] = val.trim().slice(0, maxLen);
    }
  }

  if (typeof input.priceOnRequest === 'boolean') {
    payload.priceOnRequest = input.priceOnRequest;
  }

  if (configurations.length > 0) {
    payload.configurations = configurations;
  }

  if (photos.length > 0) {
    payload.photos = photos;
  }

  const highlights = (input.highlights ?? [])
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (highlights.length > 0) {
    payload.highlights = highlights;
  }

  const unitTable: ProjectUnit[] = (input.unitTable ?? [])
    .filter((u) => u.configuration.trim() && u.price.trim())
    .slice(0, 30)
    .map((u) => {
      const cleaned: ProjectUnit = {
        configuration: u.configuration.trim(),
        price: u.price.trim(),
      };
      if (u.carpetArea?.trim()) cleaned.carpetArea = u.carpetArea.trim();
      if (u.builtUpArea?.trim()) cleaned.builtUpArea = u.builtUpArea.trim();
      if (u.floorPlanImage?.trim()) cleaned.floorPlanImage = u.floorPlanImage.trim();
      return cleaned;
    });
  if (unitTable.length > 0) {
    payload.unitTable = unitTable;
  }

  const amenities: ProjectAmenity[] = (input.amenities ?? [])
    .filter((a) => a.label.trim())
    .slice(0, 40)
    .map((a) => ({
      label: a.label.trim(),
      icon: a.icon,
      ...(a.isCustom ? { isCustom: true } : {}),
    }));
  if (amenities.length > 0) {
    payload.amenities = amenities;
  }

  const nearbyPlaces: NearbyPlace[] = (input.nearbyPlaces ?? [])
    .filter((n) => n.name.trim() && n.travelTime.trim())
    .slice(0, 30)
    .map((n) => {
      const cleaned: NearbyPlace = {
        name: n.name.trim(),
        travelTime: n.travelTime.trim(),
      };
      if (n.category?.trim()) cleaned.category = n.category.trim();
      return cleaned;
    });
  if (nearbyPlaces.length > 0) {
    payload.nearbyPlaces = nearbyPlaces;
  }

  if (input.developer && (input.developer.name?.trim() || input.developerName?.trim())) {
    const dev: DeveloperInfo = {
      name: (input.developer.name || input.developerName || '').trim(),
    };
    if (input.developer.yearEstablished?.trim()) {
      dev.yearEstablished = input.developer.yearEstablished.trim();
    }
    if (input.developer.projectsDelivered?.trim()) {
      dev.projectsDelivered = input.developer.projectsDelivered.trim();
    }
    if (input.developer.projectsOngoing?.trim()) {
      dev.projectsOngoing = input.developer.projectsOngoing.trim();
    }
    if (input.developer.shortDescription?.trim()) {
      dev.shortDescription = input.developer.shortDescription.trim();
    }
    if (input.developer.website?.trim()) {
      dev.website = input.developer.website.trim();
    }
    payload.developer = dev;
  }

  const faqs: ProjectFaq[] = (input.faqs ?? [])
    .filter((f) => f.question.trim() && f.answer.trim())
    .slice(0, 30)
    .map((f) => ({
      question: f.question.trim(),
      answer: f.answer.trim(),
    }));
  if (faqs.length > 0) {
    payload.faqs = faqs;
  }

  return payload;
}

function mapDocToProject(
  id: string,
  data: Record<string, unknown>
): Project {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : undefined;
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : undefined;

  return {
    id,
    name: String(data.name ?? ''),
    developerName:
      typeof data.developerName === 'string' ? data.developerName : undefined,
    area: typeof data.area === 'string' ? data.area : undefined,
    city: typeof data.city === 'string' ? data.city : undefined,
    pincode: typeof data.pincode === 'string' ? data.pincode : undefined,
    location: typeof data.location === 'string' ? data.location : undefined,
    googleMapsUrl:
      typeof data.googleMapsUrl === 'string' ? data.googleMapsUrl : undefined,
    priceMin: typeof data.priceMin === 'string' ? data.priceMin : undefined,
    priceMax: typeof data.priceMax === 'string' ? data.priceMax : undefined,
    priceOnRequest: Boolean(data.priceOnRequest),
    pricePerSqFt:
      typeof data.pricePerSqFt === 'string' ? data.pricePerSqFt : undefined,
    startingPrice:
      typeof data.startingPrice === 'string' ? data.startingPrice : undefined,
    type: (data.type as Project['type']) || 'Apartment',
    status: (data.status as Project['status']) || 'New Launch',
    configurations: Array.isArray(data.configurations)
      ? (data.configurations as string[])
      : undefined,
    configuration:
      typeof data.configuration === 'string' ? data.configuration : undefined,
    parking: typeof data.parking === 'string' ? data.parking : undefined,
    floors: typeof data.floors === 'string' ? data.floors : undefined,
    totalUnits: typeof data.totalUnits === 'string' ? data.totalUnits : undefined,
    totalLandArea:
      typeof data.totalLandArea === 'string' ? data.totalLandArea : undefined,
    facing: typeof data.facing === 'string' ? data.facing : undefined,
    possessionDate:
      typeof data.possessionDate === 'string' ? data.possessionDate : undefined,
    reraNumber:
      typeof data.reraNumber === 'string' ? data.reraNumber : undefined,
    highlights: Array.isArray(data.highlights)
      ? (data.highlights as string[])
      : undefined,
    description:
      typeof data.description === 'string' ? data.description : undefined,
    photos: Array.isArray(data.photos)
      ? (data.photos as ProjectPhoto[])
      : undefined,
    mainPhoto: typeof data.mainPhoto === 'string' ? data.mainPhoto : undefined,
    unitTable: Array.isArray(data.unitTable)
      ? (data.unitTable as ProjectUnit[])
      : undefined,
    amenities: Array.isArray(data.amenities)
      ? (data.amenities as ProjectAmenity[])
      : undefined,
    nearbyPlaces: Array.isArray(data.nearbyPlaces)
      ? (data.nearbyPlaces as NearbyPlace[])
      : undefined,
    developer: data.developer as DeveloperInfo | undefined,
    faqs: Array.isArray(data.faqs) ? (data.faqs as ProjectFaq[]) : undefined,
    published: Boolean(data.published),
    createdAt,
    updatedAt,
  };
}

function sortByNewest(items: Project[]): Project[] {
  return [...items].sort((a, b) => {
    const tA = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tB = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tB - tA;
  });
}

export async function fetchPublishedProjects(): Promise<Project[]> {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('published', '==', true)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) =>
      mapDocToProject(d.id, d.data() as Record<string, unknown>)
    );
    return sortByNewest(items);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
  }
}

export async function fetchAllProjectsAdmin(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    const items = snapshot.docs.map((d) =>
      mapDocToProject(d.id, d.data() as Record<string, unknown>)
    );
    return sortByNewest(items);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
  }
}

export async function createProject(input: ProjectInput): Promise<string> {
  try {
    const payload = sanitizeProjectPayload(input, { isCreate: true });
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PROJECTS_COLLECTION);
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<void> {
  const path = `${PROJECTS_COLLECTION}/${id}`;
  try {
    const payload = sanitizeProjectPayload(input, { isCreate: false });
    await updateDoc(doc(db, PROJECTS_COLLECTION, id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleProjectPublished(
  id: string,
  published: boolean
): Promise<void> {
  const path = `${PROJECTS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, PROJECTS_COLLECTION, id), {
      published,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `${PROJECTS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function uploadCompressedProjectImage(
  projectId: string,
  file: File,
  folder: 'gallery' | 'floorplans' = 'gallery'
): Promise<string> {
  const compressedFile = await compressImageFile(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
  });

  const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, '') || 'project';
  const safeFileName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(
    storage,
    `projects/${safeId}/${folder}/${Date.now()}_${safeFileName}`
  );
  await uploadBytes(storageRef, compressedFile, {
    contentType: compressedFile.type || 'image/jpeg',
  });
  return getDownloadURL(storageRef);
}
