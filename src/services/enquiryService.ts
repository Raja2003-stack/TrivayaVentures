import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';

export type EnquiryInterest =
  | 'Apartment'
  | 'Villa'
  | 'Farm Land'
  | 'Plot'
  | 'Other';

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface EnquiryPayload {
  name: string;
  phone?: string;
  email?: string;
  interestedIn?: EnquiryInterest;
  message?: string;
  projectName?: string;
  source: 'contact_section' | 'project_modal';
}

export interface EnquiryRecord extends EnquiryPayload {
  id: string;
  status: EnquiryStatus;
  createdAt: string;
}

export const ENQUIRIES_COLLECTION = 'enquiries';

export async function submitEnquiry(input: EnquiryPayload): Promise<void> {
  const payload: Record<string, unknown> = {
    name: input.name.trim().slice(0, 120),
    source: input.source,
    status: 'new' as EnquiryStatus,
    createdAt: serverTimestamp(),
  };

  if (input.phone?.trim()) {
    payload.phone = input.phone.trim().slice(0, 30);
  }
  if (input.email?.trim()) {
    payload.email = input.email.trim().slice(0, 160);
  }
  if (input.interestedIn) {
    payload.interestedIn = input.interestedIn;
  }
  if (input.message?.trim()) {
    payload.message = input.message.trim().slice(0, 2000);
  }
  if (input.projectName?.trim()) {
    payload.projectName = input.projectName.trim().slice(0, 160);
  }

  try {
    await addDoc(collection(db, ENQUIRIES_COLLECTION), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ENQUIRIES_COLLECTION);
  }
}

export async function fetchEnquiries(): Promise<EnquiryRecord[]> {
  try {
    const q = query(
      collection(db, ENQUIRIES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const createdAtValue =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : typeof data.createdAt === 'string'
            ? data.createdAt
            : new Date().toISOString();

      return {
        id: docSnap.id,
        name: String(data.name ?? ''),
        phone: typeof data.phone === 'string' ? data.phone : undefined,
        email: typeof data.email === 'string' ? data.email : undefined,
        interestedIn: data.interestedIn as EnquiryInterest | undefined,
        message: typeof data.message === 'string' ? data.message : undefined,
        projectName:
          typeof data.projectName === 'string' ? data.projectName : undefined,
        source:
          data.source === 'project_modal' ? 'project_modal' : 'contact_section',
        status:
          data.status === 'contacted' || data.status === 'closed'
            ? data.status
            : 'new',
        createdAt: createdAtValue,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ENQUIRIES_COLLECTION);
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  const path = `${ENQUIRIES_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, ENQUIRIES_COLLECTION, id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEnquiry(id: string): Promise<void> {
  const path = `${ENQUIRIES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, ENQUIRIES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
