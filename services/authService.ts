import { 
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged, 
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    deleteUser
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    photoFileName?: string;
    createdAt: number;
}

export const AuthService = {
    loginWithGoogle: async (displayName?: string) => {
        const provider = new GoogleAuthProvider();
        // Store optional display name to apply after redirect returns
        if (displayName) {
            localStorage.setItem('goldsucher_pending_name', displayName);
        }
        // Use redirect flow — more reliable on mobile web apps (no popup)
        await signInWithRedirect(auth, provider);
        // Page navigates to Google and returns; result is handled in handleRedirectResult
    },

    handleRedirectResult: async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result?.user) {
                const pendingName = localStorage.getItem('goldsucher_pending_name');
                if (pendingName) {
                    await updateProfile(result.user, { displayName: pendingName });
                    localStorage.removeItem('goldsucher_pending_name');
                }
                await AuthService.syncUserToFirestore(result.user);
            }
            return result;
        } catch (error) {
            console.error("Error handling Google redirect result", error);
            throw error;
        }
    },

    loginWithEmail: async (email: string, pass: string) => {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        if (result.user && result.user.emailVerified) {
            await AuthService.syncUserToFirestore(result.user);
        }
        return result;
    },

    registerWithEmail: async (email: string, pass: string, firstName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: firstName });
        await AuthService.syncUserToFirestore(userCredential.user, firstName);
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Sign out immediately after registration
        return userCredential;
    },

    syncUserToFirestore: async (user: User, name?: string) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const profile: UserProfile = {
                uid: user.uid,
                name: name || user.displayName || 'Goldgräber',
                email: user.email || '',
                photoFileName: '',
                createdAt: Date.now()
            };
            await setDoc(userRef, profile);
        }
    },

    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    },

    updateUserProfileInFirestore: async (uid: string, data: Partial<UserProfile>) => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    },

    deleteUserAccount: async () => {
        const user = auth.currentUser;
        if (!user) return;

        const uid = user.uid;
        // Delete Firestore data
        await deleteDoc(doc(db, 'users', uid));
        
        // Note: In a real app, you might want to delete their locations too, 
        // but the request says "update records accordingly".
        
        // Delete Auth user
        await deleteUser(user);
    },

    resetPassword: async (email: string) => {
        return sendPasswordResetEmail(auth, email);
    },

    updateUserProfile: async (user: User, displayName: string) => {
        return updateProfile(user, { displayName });
    },

    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out", error);
            throw error;
        }
    },

    subscribeToAuth: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    getCurrentUser: () => {
        return auth.currentUser;
    }
};
