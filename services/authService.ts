import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase.ts';

export const signUpWithEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email automatically upon sign-up
    await sendEmailVerification(userCredential.user);
    return userCredential;
};

export const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
};

export const signOutUser = () => {
    return signOut(auth);
};

export const resendVerificationEmail = () => {
    const user = auth.currentUser;
    if (user) {
        return sendEmailVerification(user);
    }
    return Promise.reject(new Error("No user is currently signed in."));
};