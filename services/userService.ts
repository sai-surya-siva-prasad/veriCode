
import { User, UserProgress } from '../types';
import { auth, db } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query 
} from "firebase/firestore";

export const loginUser = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    
    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || 'User',
      email: fbUser.email || '',
      avatarUrl: fbUser.photoURL || undefined
    };

    // Create/Update user document in Firestore to ensure it exists
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        lastLogin: Date.now()
    }, { merge: true });

    return user;
  } catch (error: any) {
    console.error("Error signing in", error);
    
    // Provide more descriptive errors for common Firebase issues
    if (error.code === 'auth/configuration-not-found') {
      throw new Error("Google Sign-In is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Google.");
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error("This domain is not authorized. Go to Firebase Console > Authentication > Settings > Authorized domains and add this URL.");
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Sign-in popup was blocked by your browser. Please allow popups.");
    }
    
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Note: getCurrentUser is synchronous in the old mock, but async in Firebase.
// We handle this via the onAuthStateChanged listener in App.tsx mainly.
// This function helps for immediate checks if initialized.
export const getCurrentUser = (): User | null => {
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  
  return {
    id: fbUser.uid,
    name: fbUser.displayName || 'User',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || undefined
  };
};

export const saveUserProgress = async (userId: string, progress: UserProgress) => {
  try {
    // We store progress in a subcollection: users/{userId}/progress/{problemId}
    const progressRef = doc(db, "users", userId, "progress", progress.problemId);
    await setDoc(progressRef, progress);
  } catch (error) {
    console.error("Error saving progress", error);
  }
};

export const getUserProgress = async (userId: string, problemId: string): Promise<UserProgress | null> => {
  try {
    const progressRef = doc(db, "users", userId, "progress", problemId);
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProgress;
    }
    return null;
  } catch (error) {
    console.error("Error fetching progress", error);
    return null;
  }
};

export const getAllUserProgress = async (userId: string): Promise<Record<string, UserProgress>> => {
  try {
    const progressRef = collection(db, "users", userId, "progress");
    const q = query(progressRef);
    const querySnapshot = await getDocs(q);
    
    const progressMap: Record<string, UserProgress> = {};
    querySnapshot.forEach((doc) => {
      progressMap[doc.id] = doc.data() as UserProgress;
    });
    
    return progressMap;
  } catch (error) {
    console.error("Error fetching all progress", error);
    return {};
  }
};

export const getUserStats = async (userId: string) => {
  const progressMap = await getAllUserProgress(userId);
  const values = Object.values(progressMap);
  
  return {
    totalSolved: values.filter(p => p.status === 'solved').length,
    totalAttempted: values.length,
    recentActivity: values.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
  };
};

// Helper for App.tsx to subscribe to auth changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
            callback({
                id: fbUser.uid,
                name: fbUser.displayName || 'User',
                email: fbUser.email || '',
                avatarUrl: fbUser.photoURL || undefined
            });
        } else {
            callback(null);
        }
    });
}
