import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  Timestamp,
  serverTimestamp,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Interface for Waste Report
export interface WasteReport {
  id?: string;
  userId: string;
  userName: string;
  wasteType: string;
  notes: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl: string;
  status: 'pending' | 'assigned' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  resolvedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Report Service for CRUD operations
class ReportService {
  private reportsCollection = collection(db, 'reports');
  
  // Create a new waste report
  async createReport(reportData: Omit<WasteReport, 'id' | 'createdAt'>, imageFile: File): Promise<string> {
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `waste-images/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      
      // Create report document in Firestore
      const docRef = await addDoc(this.reportsCollection, {
        ...reportData,
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
  
  // Get all reports (with pagination)
  async getReports(pageSize = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{
    reports: WasteReport[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      let q;
      
      if (lastDoc) {
        q = query(
          this.reportsCollection,
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          this.reportsCollection,
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const reports: WasteReport[] = [];
      let lastVisible = null;
      
      querySnapshot.forEach((doc) => {
        lastVisible = doc;
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data
        } as WasteReport);
      });
      
      return { reports, lastDoc: lastVisible };
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }
  
  // Get reports by user ID
  async getUserReports(userId: string): Promise<WasteReport[]> {
    try {
      const q = query(
        this.reportsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: WasteReport[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data
        } as WasteReport);
      });
      
      return reports;
    } catch (error) {
      console.error('Error getting user reports:', error);
      throw error;
    }
  }
  
  // Get a single report by ID
  async getReportById(reportId: string): Promise<WasteReport | null> {
    try {
      const reportDoc = await getDoc(doc(db, 'reports', reportId));
      
      if (reportDoc.exists()) {
        const data = reportDoc.data();
        return {
          id: reportDoc.id,
          ...data
        } as WasteReport;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting report:', error);
      throw error;
    }
  }
  
  // Update report status
  async updateReportStatus(
    reportId: string, 
    status: 'pending' | 'assigned' | 'resolved',
    assignedTo?: string
  ): Promise<void> {
    try {
      const reportRef = doc(db, 'reports', reportId);
      
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (status === 'assigned' && assignedTo) {
        updateData.assignedTo = assignedTo;
      }
      
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }
      
      await updateDoc(reportRef, updateData);
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }
  
  // Update report priority
  async updateReportPriority(reportId: string, priority: 'low' | 'medium' | 'high'): Promise<void> {
    try {
      const reportRef = doc(db, 'reports', reportId);
      
      await updateDoc(reportRef, {
        priority,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating report priority:', error);
      throw error;
    }
  }
  
  // Get reports by status
  async getReportsByStatus(status: 'pending' | 'assigned' | 'resolved'): Promise<WasteReport[]> {
    try {
      const q = query(
        this.reportsCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: WasteReport[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data
        } as WasteReport);
      });
      
      return reports;
    } catch (error) {
      console.error('Error getting reports by status:', error);
      throw error;
    }
  }
  
  // Get reports by waste type
  async getReportsByWasteType(wasteType: string): Promise<WasteReport[]> {
    try {
      const q = query(
        this.reportsCollection,
        where('wasteType', '==', wasteType),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: WasteReport[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data
        } as WasteReport);
      });
      
      return reports;
    } catch (error) {
      console.error('Error getting reports by waste type:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService(); 