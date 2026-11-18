import { ChangeEvent, DragEvent, FormEvent, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  Droplets,
  Dumbbell,
  Footprints,
  GripVertical,
  Plus,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Trees,
  Upload,
  Users,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import {
  ProjectInput,
  createProject,
  updateProject,
  uploadCompressedProjectImage,
} from '../services/projectService';
import {
  AMENITY_ICON_OPTIONS,
  AmenityIconName,
  NearbyPlace,
  PRESET_AMENITIES,
  Project,
  ProjectAmenity,
  ProjectFaq,
  ProjectPhoto,
  ProjectStatus,
  ProjectType,
  ProjectUnit,
} from '../types/project';

interface AdminProjectFormProps {
  initialProject?: Project | null;
  onSaved: () => Promise<void> | void;
  onCancel: () => void;
}

const AMENITY_ICONS: Record<AmenityIconName, typeof Trees> = {
  trees: Trees,
  waves: Waves,
  dumbbell: Dumbbell,
  shield: ShieldCheck,
  zap: Zap,
  car: Car,
  droplets: Droplets,
  sun: Sun,
  footprints: Footprints,
  users: Users,
};

export function AdminProjectForm({
  initialProject,
  onSaved,
  onCancel,
}: AdminProjectFormProps) {
  const isEditing = Boolean(initialProject);

  // Basic Info
  const [name, setName] = useState(initialProject?.name ?? '');
  const [developerName, setDeveloperName] = useState(
    initialProject?.developerName ?? initialProject?.developer?.name ?? ''
  );
  const [type, setType] = useState<ProjectType>(
    initialProject?.type ?? 'Apartment'
  );
  const [status, setStatus] = useState<ProjectStatus>(
    initialProject?.status ?? 'New Launch'
  );
  const [published, setPublished] = useState<boolean>(
    initialProject?.published ?? true
  );

  // Location
  const [area, setArea] = useState(initialProject?.area ?? '');
  const [city, setCity] = useState(initialProject?.city ?? 'Bengaluru');
  const [pincode, setPincode] = useState(initialProject?.pincode ?? '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialProject?.googleMapsUrl ?? ''
  );

  // Pricing
  const [priceOnRequest, setPriceOnRequest] = useState<boolean>(
    initialProject?.priceOnRequest ?? false
  );
  const [priceMin, setPriceMin] = useState(initialProject?.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(initialProject?.priceMax ?? '');
  const [pricePerSqFt, setPricePerSqFt] = useState(
    initialProject?.pricePerSqFt ?? ''
  );

  // Configurations (list)
  const [configurations, setConfigurations] = useState<string[]>(
    initialProject?.configurations ??
      (initialProject?.configuration ? [initialProject.configuration] : [])
  );
  const [configDraft, setConfigDraft] = useState('');

  // Specifications
  const [parking, setParking] = useState(initialProject?.parking ?? '');
  const [floors, setFloors] = useState(initialProject?.floors ?? '');
  const [totalUnits, setTotalUnits] = useState(initialProject?.totalUnits ?? '');
  const [totalLandArea, setTotalLandArea] = useState(
    initialProject?.totalLandArea ?? ''
  );
  const [facing, setFacing] = useState(initialProject?.facing ?? '');
  const [possessionDate, setPossessionDate] = useState(
    initialProject?.possessionDate ?? ''
  );
  const [reraNumber, setReraNumber] = useState(initialProject?.reraNumber ?? '');

  // Description & Highlights
  const [description, setDescription] = useState(
    initialProject?.description ?? ''
  );
  const [highlights, setHighlights] = useState<string[]>(
    initialProject?.highlights && initialProject.highlights.length > 0
      ? initialProject.highlights
      : ['']
  );

  // Photos (multi-upload, drag to reorder, mark main)
  const [photos, setPhotos] = useState<ProjectPhoto[]>(() => {
    if (initialProject?.photos && initialProject.photos.length > 0) {
      return initialProject.photos;
    }
    if (initialProject?.mainPhoto) {
      return [{ url: initialProject.mainPhoto, isMain: true }];
    }
    return [];
  });
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  // Unit Table
  const [unitTable, setUnitTable] = useState<ProjectUnit[]>(
    initialProject?.unitTable ?? []
  );
  const [uploadingFloorPlanIndex, setUploadingFloorPlanIndex] = useState<
    number | null
  >(null);

  // Amenities (preset checkboxes + custom)
  const [amenities, setAmenities] = useState<ProjectAmenity[]>(
    initialProject?.amenities ?? []
  );
  const [customAmenityLabel, setCustomAmenityLabel] = useState('');
  const [customAmenityIcon, setCustomAmenityIcon] =
    useState<AmenityIconName>('trees');

  // Nearby Places
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>(
    initialProject?.nearbyPlaces ?? []
  );

  // Developer Info
  const [yearEstablished, setYearEstablished] = useState(
    initialProject?.developer?.yearEstablished ?? ''
  );
  const [projectsDelivered, setProjectsDelivered] = useState(
    initialProject?.developer?.projectsDelivered ?? ''
  );
  const [projectsOngoing, setProjectsOngoing] = useState(
    initialProject?.developer?.projectsOngoing ?? ''
  );
  const [developerDescription, setDeveloperDescription] = useState(
    initialProject?.developer?.shortDescription ?? ''
  );
  const [developerWebsite, setDeveloperWebsite] = useState(
    initialProject?.developer?.website ?? ''
  );

  // FAQs
  const [faqs, setFaqs] = useState<ProjectFaq[]>(initialProject?.faqs ?? []);

  // Form submission state
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const storageProjectFolder =
    initialProject?.id ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    'draft';

  // Configuration tag helpers
  const handleAddConfig = () => {
    const trimmed = configDraft.trim();
    if (!trimmed) return;
    if (!configurations.includes(trimmed)) {
      setConfigurations((prev) => [...prev, trimmed]);
    }
    setConfigDraft('');
  };

  // Multi-photo upload with browser compression
  const handlePhotoFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingPhotos(true);
    setFormError(null);

    try {
      const files = Array.from(fileList);
      const uploadedUrls = await Promise.all(
        files.map((file) =>
          uploadCompressedProjectImage(storageProjectFolder, file, 'gallery')
        )
      );

      setPhotos((prev) => {
        const hasMainAlready = prev.some((p) => p.isMain);
        const appended: ProjectPhoto[] = uploadedUrls.map((url, idx) => ({
          url,
          isMain: !hasMainAlready && prev.length === 0 && idx === 0,
        }));
        return [...prev, ...appended];
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Photo upload failed: ${error.message}`
          : 'Failed to upload one or more photos.'
      );
    } finally {
      setUploadingPhotos(false);
      event.target.value = '';
    }
  };

  const handleSetMainPhoto = (index: number) => {
    setPhotos((prev) =>
      prev.map((photo, idx) => ({
        ...photo,
        isMain: idx === index,
      }))
    );
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((p) => p.isMain)) {
        filtered[0] = { ...filtered[0], isMain: true };
      }
      return filtered;
    });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    setPhotos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handlePhotoDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handlePhotoDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handlePhotoDrop = (targetIndex: number) => {
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) {
      setDraggedPhotoIndex(null);
      return;
    }
    movePhoto(draggedPhotoIndex, targetIndex);
    setDraggedPhotoIndex(null);
  };

  // Floor plan upload for a unit row
  const handleUnitFloorPlanUpload = async (
    unitIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFloorPlanIndex(unitIndex);
    setFormError(null);

    try {
      const url = await uploadCompressedProjectImage(
        storageProjectFolder,
        file,
        'floorplans'
      );
      setUnitTable((prev) =>
        prev.map((row, idx) =>
          idx === unitIndex ? { ...row, floorPlanImage: url } : row
        )
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Floor plan upload failed: ${error.message}`
          : 'Failed to upload floor plan image.'
      );
    } finally {
      setUploadingFloorPlanIndex(null);
      event.target.value = '';
    }
  };

  // Amenities checkboxes & custom
  const isPresetChecked = (label: string) =>
    amenities.some((a) => a.label.toLowerCase() === label.toLowerCase());

  const togglePresetAmenity = (preset: ProjectAmenity) => {
    setAmenities((prev) => {
      const exists = prev.some(
        (a) => a.label.toLowerCase() === preset.label.toLowerCase()
      );
      if (exists) {
        return prev.filter(
          (a) => a.label.toLowerCase() !== preset.label.toLowerCase()
        );
      }
      return [...prev, preset];
    });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityLabel.trim();
    if (!trimmed) return;
    if (
      !amenities.some((a) => a.label.toLowerCase() === trimmed.toLowerCase())
    ) {
      setAmenities((prev) => [
        ...prev,
        { label: trimmed, icon: customAmenityIcon, isCustom: true },
      ]);
    }
    setCustomAmenityLabel('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError('Project name must be at least 2 characters.');
      return;
    }

    if (uploadingPhotos || uploadingFloorPlanIndex !== null) {
      setFormError('Please wait for image uploads to finish before saving.');
      return;
    }

    setSaving(true);

    try {
      const effectiveConfigs =
        configDraft.trim() && !configurations.includes(configDraft.trim())
          ? [...configurations, configDraft.trim()]
          : configurations;

      const projectData: ProjectInput = {
        name: name.trim(),
        developerName: developerName.trim() || undefined,
        area: area.trim() || undefined,
        city: city.trim() || undefined,
        pincode: pincode.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        priceOnRequest,
        priceMin: priceOnRequest ? undefined : priceMin.trim() || undefined,
        priceMax: priceOnRequest ? undefined : priceMax.trim() || undefined,
        pricePerSqFt: pricePerSqFt.trim() || undefined,
        type,
        status,
        configurations: effectiveConfigs,
        parking: parking.trim() || undefined,
        floors: floors.trim() || undefined,
        totalUnits: totalUnits.trim() || undefined,
        totalLandArea: totalLandArea.trim() || undefined,
        facing: facing.trim() || undefined,
        possessionDate: possessionDate.trim() || undefined,
        reraNumber: reraNumber.trim() || undefined,
        highlights: highlights.map((h) => h.trim()).filter(Boolean),
        description: description.trim() || undefined,
        photos,
        unitTable: unitTable.filter(
          (u) => u.configuration.trim() && u.price.trim()
        ),
        amenities,
        nearbyPlaces: nearbyPlaces.filter(
          (n) => n.name.trim() && n.travelTime.trim()
        ),
        developer: developerName.trim()
          ? {
              name: developerName.trim(),
              yearEstablished: yearEstablished.trim() || undefined,
              projectsDelivered: projectsDelivered.trim() || undefined,
              projectsOngoing: projectsOngoing.trim() || undefined,
              shortDescription: developerDescription.trim() || undefined,
              website: developerWebsite.trim() || undefined,
            }
          : undefined,
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
        published,
      };

      if (isEditing && initialProject) {
        await updateProject(initialProject.id, projectData);
      } else {
        await createProject(projectData);
      }

      await onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to save project.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#0B2545]/15 bg-white p-5 sm:p-8 space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B2545]/10 pb-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B2545]">
            {isEditing ? `Edit Project: ${initialProject?.name}` : 'Add New Project'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70">
            Images are automatically compressed in your browser before uploading to Firebase Storage.
          </p>
        </div>

        <label className="inline-flex items-center gap-2.5 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-4 py-2 text-sm font-semibold text-[#0B2545] cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-[#0B2545]"
          />
          <span>Published on website</span>
        </label>
      </div>

      {/* 1. Core Details */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-semibold text-[#0B2545]">
          Basic Details
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Developer Name
            </label>
            <input
              type="text"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Developer name"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProjectType)}
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Farm Land">Farm Land</option>
              <option value="Plot">Plot</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            >
              <option value="New Launch">New Launch</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Ready to Move">Ready to Move</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              RERA Number (Optional)
            </label>
            <input
              type="text"
              value={reraNumber}
              onChange={(e) => setReraNumber(e.target.value)}
              placeholder="e.g. PRM/KA/RERA/..."
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* 2. Location */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <legend className="font-serif text-lg font-semibold text-[#0B2545]">
          Location
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Area / Locality
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Electronic City"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bengaluru"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Pincode
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="560100"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm tabular-nums focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Google Maps Link
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* 3. Pricing & Specifications */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <legend className="font-serif text-lg font-semibold text-[#0B2545]">
            Pricing & Specifications
          </legend>

          <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0B2545] cursor-pointer">
            <input
              type="checkbox"
              checked={priceOnRequest}
              onChange={(e) => setPriceOnRequest(e.target.checked)}
              className="h-4 w-4 accent-[#0B2545]"
            />
            <span>Price &quot;On request&quot;</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Price Min
            </label>
            <input
              type="text"
              disabled={priceOnRequest}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="e.g. ₹ 1.15 Cr"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm disabled:bg-slate-100 focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Price Max
            </label>
            <input
              type="text"
              disabled={priceOnRequest}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="e.g. ₹ 1.85 Cr"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm disabled:bg-slate-100 focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Price per sq.ft
            </label>
            <input
              type="text"
              value={pricePerSqFt}
              onChange={(e) => setPricePerSqFt(e.target.value)}
              placeholder="e.g. ₹ 8,500 / sq.ft"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Parking
            </label>
            <input
              type="text"
              value={parking}
              onChange={(e) => setParking(e.target.value)}
              placeholder="e.g. Covered Basement Parking"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Floors
            </label>
            <input
              type="text"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              placeholder="e.g. B + G + 14 Floors"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Total Units
            </label>
            <input
              type="text"
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              placeholder="e.g. 120 Units"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Total Land Area
            </label>
            <input
              type="text"
              value={totalLandArea}
              onChange={(e) => setTotalLandArea(e.target.value)}
              placeholder="e.g. 3.5 Acres"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Facing
            </label>
            <input
              type="text"
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              placeholder="e.g. East & North"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Possession Date
            </label>
            <input
              type="text"
              value={possessionDate}
              onChange={(e) => setPossessionDate(e.target.value)}
              placeholder="e.g. December 2027"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
          </div>
        </div>

        {/* Configurations List */}
        <div>
          <label className="block text-xs font-semibold text-[#0B2545]">
            Configurations (List)
          </label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {configurations.map((cfg, idx) => (
              <span
                key={`${cfg}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545]"
              >
                <span>{cfg}</span>
                <button
                  type="button"
                  onClick={() =>
                    setConfigurations((prev) => prev.filter((_, i) => i !== idx))
                  }
                  aria-label={`Remove ${cfg}`}
                  className="text-[#1F2937]/60 hover:text-red-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2 max-w-md">
            <input
              type="text"
              value={configDraft}
              onChange={(e) => setConfigDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddConfig();
                }
              }}
              placeholder="e.g. 2 BHK, 3 BHK, 30x40 Plot"
              className="flex-1 rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddConfig}
              className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/25 bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </fieldset>

      {/* 4. Description & Highlights */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <legend className="font-serif text-lg font-semibold text-[#0B2545]">
          Description & Highlights
        </legend>

        <div>
          <label className="block text-xs font-semibold text-[#0B2545]">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project architecture, lifestyle, and investment appeal"
            className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2.5 text-sm focus:border-[#C9A227] focus:outline-none"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#0B2545]">
              Highlights
            </label>
            <button
              type="button"
              onClick={() => setHighlights((prev) => [...prev, ''])}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] hover:text-[#C9A227] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Highlight</span>
            </button>
          </div>

          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  setHighlights((prev) =>
                    prev.map((h, i) => (i === idx ? e.target.value : h))
                  )
                }
                placeholder={`Highlight ${idx + 1}`}
                className="flex-1 rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm focus:border-[#C9A227] focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setHighlights((prev) => prev.filter((_, i) => i !== idx))
                }
                aria-label="Remove highlight"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#0B2545]/15 text-[#1F2937]/65 hover:border-red-300 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* 5. Photos (multi-upload, compressed, drag to reorder, mark main) */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <legend className="font-serif text-lg font-semibold text-[#0B2545]">
              Photos
            </legend>
            <p className="text-xs text-[#1F2937]/70">
              Upload multiple images, drag thumbnails to reorder, and mark one as the main photo.
            </p>
          </div>

          <label className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#0B2545] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>{uploadingPhotos ? 'Compressing & Uploading...' : 'Upload Photos'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingPhotos}
              onChange={handlePhotoFilesChange}
              className="sr-only"
            />
          </label>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={`${photo.url}-${index}`}
                draggable
                onDragStart={() => handlePhotoDragStart(index)}
                onDragOver={handlePhotoDragOver}
                onDrop={() => handlePhotoDrop(index)}
                className={`group rounded-lg border bg-[#F5F7FA] p-3 transition-all ${
                  photo.isMain
                    ? 'border-[#C9A227] ring-1 ring-[#C9A227]'
                    : 'border-[#0B2545]/15'
                } ${draggedPhotoIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white">
                  <img
                    src={photo.url}
                    alt={`${name.trim() || 'Project'} gallery photo ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-sm bg-[#0B2545]/85 px-2 py-1 text-[11px] font-medium text-white">
                    <GripVertical className="h-3.5 w-3.5 text-[#C9A227]" />
                    <span>Drag #{index + 1}</span>
                  </div>
                  {photo.isMain && (
                    <span className="absolute right-2 top-2 rounded-sm bg-[#C9A227] px-2 py-0.5 text-[11px] font-semibold text-[#0B2545]">
                      Main Photo
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetMainPhoto(index)}
                    className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                      photo.isMain
                        ? 'bg-[#C9A227]/25 text-[#0B2545]'
                        : 'border border-[#0B2545]/20 bg-white text-[#0B2545] hover:border-[#C9A227]'
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    <span>{photo.isMain ? 'Main' : 'Set Main'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePhoto(index, index - 1)}
                      aria-label="Move photo left"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-[#0B2545]/15 bg-white text-[#0B2545] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => movePhoto(index, index + 1)}
                      aria-label="Move photo right"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-[#0B2545]/15 bg-white text-[#0B2545] disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      aria-label="Remove photo"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-[#0B2545]/15 bg-white text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* 6. Unit Table */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <div className="flex items-center justify-between">
          <legend className="font-serif text-lg font-semibold text-[#0B2545]">
            Unit Table
          </legend>
          <button
            type="button"
            onClick={() =>
              setUnitTable((prev) => [
                ...prev,
                { configuration: '', carpetArea: '', builtUpArea: '', price: '' },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Unit Row</span>
          </button>
        </div>

        {unitTable.length > 0 && (
          <div className="space-y-3">
            {unitTable.map((unit, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#0B2545]/15 bg-[#F5F7FA] p-4 space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    type="text"
                    value={unit.configuration}
                    onChange={(e) =>
                      setUnitTable((prev) =>
                        prev.map((u, i) =>
                          i === idx ? { ...u, configuration: e.target.value } : u
                        )
                      )
                    }
                    placeholder="Configuration (e.g. 2 BHK)"
                    className="rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={unit.carpetArea ?? ''}
                    onChange={(e) =>
                      setUnitTable((prev) =>
                        prev.map((u, i) =>
                          i === idx ? { ...u, carpetArea: e.target.value } : u
                        )
                      )
                    }
                    placeholder="Carpet area (e.g. 920 sq.ft)"
                    className="rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={unit.builtUpArea ?? ''}
                    onChange={(e) =>
                      setUnitTable((prev) =>
                        prev.map((u, i) =>
                          i === idx ? { ...u, builtUpArea: e.target.value } : u
                        )
                      )
                    }
                    placeholder="Built-up area (e.g. 1,280 sq.ft)"
                    className="rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={unit.price}
                    onChange={(e) =>
                      setUnitTable((prev) =>
                        prev.map((u, i) =>
                          i === idx ? { ...u, price: e.target.value } : u
                        )
                      )
                    }
                    placeholder="Price (e.g. ₹ 1.18 Cr)"
                    className="rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 rounded-md border border-[#0B2545]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-[#C9A227]" />
                      <span>
                        {uploadingFloorPlanIndex === idx
                          ? 'Uploading...'
                          : unit.floorPlanImage
                            ? 'Replace Floor Plan'
                            : 'Upload Floor Plan (Optional)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingFloorPlanIndex === idx}
                        onChange={(e) => handleUnitFloorPlanUpload(idx, e)}
                        className="sr-only"
                      />
                    </label>
                    {unit.floorPlanImage && (
                      <div className="flex items-center gap-2">
                        <img
                          src={unit.floorPlanImage}
                          alt={`${unit.configuration || 'Unit'} floor plan preview`}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-9 w-12 rounded border border-[#0B2545]/15 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUnitTable((prev) =>
                              prev.map((u, i) =>
                                i === idx ? { ...u, floorPlanImage: undefined } : u
                              )
                            )
                          }
                          className="text-xs text-red-700 hover:underline cursor-pointer"
                        >
                          Remove Plan
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setUnitTable((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Row</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* 7. Amenities (checkboxes with icons + custom) */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <legend className="font-serif text-lg font-semibold text-[#0B2545]">
          Amenities
        </legend>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_AMENITIES.map((preset) => {
            const Icon = AMENITY_ICONS[preset.icon];
            const checked = isPresetChecked(preset.label);
            return (
              <label
                key={preset.label}
                className={`flex items-center gap-3 rounded-md border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                  checked
                    ? 'border-[#C9A227] bg-[#F5F7FA] text-[#0B2545] font-semibold'
                    : 'border-[#0B2545]/15 bg-white text-[#1F2937]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePresetAmenity(preset)}
                  className="h-4 w-4 accent-[#0B2545]"
                />
                <Icon className="h-4 w-4 shrink-0 text-[#C9A227]" />
                <span>{preset.label}</span>
              </label>
            );
          })}
        </div>

        {/* Custom Amenities */}
        <div className="pt-2 space-y-3">
          <p className="text-xs font-semibold text-[#0B2545]">
            Add Custom Amenity
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={customAmenityLabel}
              onChange={(e) => setCustomAmenityLabel(e.target.value)}
              placeholder="Custom amenity name"
              className="flex-1 min-w-[200px] rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm"
            />
            <select
              value={customAmenityIcon}
              onChange={(e) =>
                setCustomAmenityIcon(e.target.value as AmenityIconName)
              }
              className="rounded-md border border-[#0B2545]/20 px-3 py-2 text-sm"
            >
              {AMENITY_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCustomAmenity}
              className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/25 bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom</span>
            </button>
          </div>

          {amenities.filter((a) => a.isCustom).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities
                .filter((a) => a.isCustom)
                .map((custom) => {
                  const Icon = AMENITY_ICONS[custom.icon] ?? Check;
                  return (
                    <span
                      key={custom.label}
                      className="inline-flex items-center gap-2 rounded-md border border-[#C9A227] bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545]"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#C9A227]" />
                      <span>{custom.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAmenities((prev) =>
                            prev.filter((a) => a.label !== custom.label)
                          )
                        }
                        aria-label={`Remove ${custom.label}`}
                        className="text-[#1F2937]/60 hover:text-red-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
            </div>
          )}
        </div>
      </fieldset>

      {/* 8. Nearby Places */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <div className="flex items-center justify-between">
          <legend className="font-serif text-lg font-semibold text-[#0B2545]">
            Nearby Places
          </legend>
          <button
            type="button"
            onClick={() =>
              setNearbyPlaces((prev) => [
                ...prev,
                { name: '', category: '', travelTime: '' },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Place</span>
          </button>
        </div>

        {nearbyPlaces.map((place, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-3 rounded-md border border-[#0B2545]/12 bg-[#F5F7FA] p-3 sm:grid-cols-12 items-center"
          >
            <input
              type="text"
              value={place.name}
              onChange={(e) =>
                setNearbyPlaces((prev) =>
                  prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                )
              }
              placeholder="Place name"
              className="sm:col-span-5 rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={place.category ?? ''}
              onChange={(e) =>
                setNearbyPlaces((prev) =>
                  prev.map((p, i) =>
                    i === idx ? { ...p, category: e.target.value } : p
                  )
                )
              }
              placeholder="Category (e.g. Metro, School, Hospital)"
              className="sm:col-span-4 rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
            />
            <div className="sm:col-span-3 flex items-center gap-2">
              <input
                type="text"
                value={place.travelTime}
                onChange={(e) =>
                  setNearbyPlaces((prev) =>
                    prev.map((p, i) =>
                      i === idx ? { ...p, travelTime: e.target.value } : p
                    )
                  )
                }
                placeholder="Travel time (e.g. 12 mins)"
                className="flex-1 rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setNearbyPlaces((prev) => prev.filter((_, i) => i !== idx))
                }
                aria-label="Remove nearby place"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0B2545]/15 bg-white text-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </fieldset>

      {/* 9. Developer Info */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <legend className="font-serif text-lg font-semibold text-[#0B2545]">
          Developer Info
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Year Established
            </label>
            <input
              type="text"
              value={yearEstablished}
              onChange={(e) => setYearEstablished(e.target.value)}
              placeholder="e.g. 2005"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Projects Delivered
            </label>
            <input
              type="text"
              value={projectsDelivered}
              onChange={(e) => setProjectsDelivered(e.target.value)}
              placeholder="e.g. 14"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Projects Ongoing
            </label>
            <input
              type="text"
              value={projectsOngoing}
              onChange={(e) => setProjectsOngoing(e.target.value)}
              placeholder="e.g. 4"
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B2545]">
              Website
            </label>
            <input
              type="url"
              value={developerWebsite}
              onChange={(e) => setDeveloperWebsite(e.target.value)}
              placeholder="https://..."
              className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0B2545]">
            Short Description
          </label>
          <textarea
            rows={2}
            value={developerDescription}
            onChange={(e) => setDeveloperDescription(e.target.value)}
            placeholder="Brief background on the developer"
            className="mt-1.5 w-full rounded-md border border-[#0B2545]/20 px-3.5 py-2 text-sm"
          />
        </div>
      </fieldset>

      {/* 10. FAQs */}
      <fieldset className="space-y-4 border-t border-[#0B2545]/10 pt-6">
        <div className="flex items-center justify-between">
          <legend className="font-serif text-lg font-semibold text-[#0B2545]">
            FAQs
          </legend>
          <button
            type="button"
            onClick={() =>
              setFaqs((prev) => [...prev, { question: '', answer: '' }])
            }
            className="inline-flex items-center gap-1 rounded-md border border-[#0B2545]/20 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold text-[#0B2545] hover:border-[#C9A227] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#0B2545]/12 bg-[#F5F7FA] p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, question: e.target.value } : f
                    )
                  )
                }
                placeholder={`Question ${idx + 1}`}
                className="flex-1 rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== idx))}
                aria-label="Remove FAQ"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#0B2545]/15 bg-white text-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) =>
                setFaqs((prev) =>
                  prev.map((f, i) =>
                    i === idx ? { ...f, answer: e.target.value } : f
                  )
                )
              }
              placeholder="Answer"
              className="w-full rounded-md border border-[#0B2545]/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        ))}
      </fieldset>

      {formError && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {formError}
        </p>
      )}

      {/* Form Footer Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#0B2545]/10 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#0B2545]/20 px-6 py-2.5 text-sm font-semibold text-[#0B2545] hover:bg-[#F5F7FA] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || uploadingPhotos || uploadingFloorPlanIndex !== null}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#0B2545] px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] disabled:opacity-60 cursor-pointer"
        >
          {saving
            ? 'Saving Project...'
            : isEditing
              ? 'Update Project'
              : 'Save Project'}
        </button>
      </div>
    </form>
  );
}
