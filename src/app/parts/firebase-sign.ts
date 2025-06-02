import { getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
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
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // On mobile, always use redirect
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
    return checkUser;
  } else {
    // On desktop, use popup
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        if (credential) {
          return checkUser;
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
};

export const addUserToDB = async (user: any) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        // ...fields to update if needed
      });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
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
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
      }
    })
    .catch((error) => {
      console.error("Google redirect error:", error);
    });
      
    }

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
      googleSignIn();
    }
  }
};