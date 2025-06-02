import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";


export const logOut = () => {
  if(typeof window !== "undefined") {
  auth.signOut().then(() => {
    localStorage.removeItem("user");
    window.location.href = "../";
  }).catch((error) => {
    console.log(error);
  });
  }
}

const provider = new GoogleAuthProvider();

export const googleSignIn = () => {
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    // The signed-in user info.
    const user = result.user;
    if (credential) {
      return checkUser;
    }
    // Go to the user's profile page
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
  });
}

export const googleSignInRedirect = () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
};

export const addUserToDB = async (user: any) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Only update fields, don't overwrite the whole document
      await updateDoc(userRef, {
      });
    } else {
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
    window.location.href = `/profile?uid=${user.uid}`;
  } catch (error) {
    console.error("Error adding/updating document: ", error);
  }
};

export const checkUser = () => {
  if(typeof window !== "undefined") {
  auth.onAuthStateChanged((user) => {
    if (user) {
  }
    else {
      document.getElementById("landing")?.style.setProperty("display", "grid");
    }
  }
  );
}
}

export const checkUserOut = () => {
  auth.onAuthStateChanged((user) => {
    if (!user && typeof window !== "undefined") {
      changeDisplay();
      window.location.href = "/";
    }
  }
  );
}

const changeDisplay = () => {
  document.getElementById("profile")?.style.setProperty("display", "none");
  document.getElementById("watermark")?.style.setProperty("display", "none");
  document.getElementById("navbar")?.style.setProperty("display", "none");
}

export const logIn = () => {
  if (typeof window !== "undefined") {
    const user = auth.currentUser;
    if (user) {
      window.location.href = `/profile?uid=${user.uid}`;
    } else {
      googleSignInRedirect();
    }
  }
};