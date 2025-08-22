import { getRedirectResult, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";


export const logOut = () => {
  if(typeof window !== "undefined") {
  auth.signOut().then(() => {
    localStorage.removeItem("user");
    window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Successfully logged out.",
        })
      );
  }).catch((error) => {
    console.log(error);
  });
  }
}

const provider = new GoogleAuthProvider();

export const googleSignIn = () => {
    // On desktop, use popup
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        if (credential) {
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Error during Google sign-in:", errorCode, errorMessage, email, credential);
      });
  }


export const addUserToDB = async (user: any) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        postCreatedAt: null,
      });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        postCreatedAt: null,
        joinedAt:  new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
        createdAt: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
      });
    }
    // REMOVE window.location.href from here!
  } catch (error) {
    console.error("Error adding/updating document: ", error);
  }
};

export const redirectResults = () => {
  getRedirectResult(auth)
    .then(async (result) => {
      if (result && result.user) {
        await addUserToDB(result.user);
        // Możesz przekierować tutaj, ale lepiej zrobić to w onAuthStateChanged (patrz niżej)
        // window.location.href = `/profile?uid=${result.user.uid}`;
      }
    })
    .catch((error) => {
      console.error("Google redirect error:", error);
    });
};

export const logIn = () => {
  if (typeof window !== "undefined") {
    const user = auth.currentUser;
    if (user) {
      window.location.href = `/profile?uid=${user.uid}`;
    } else {
      googleSignIn();
    }
  }
};