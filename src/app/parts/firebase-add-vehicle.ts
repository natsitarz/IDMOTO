//Pass form to firebase 
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const firebaseAddVehiclePublic = async (formData: FormData) => {
  const formDataObject: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    formDataObject[key] = value.toString();
  });
  const user = auth.currentUser;

  if (user) {
    try {
      await addDoc(collection(db, "vehicles"), {
        ...formDataObject,
        createdAt: serverTimestamp(),
        user: user.displayName,
        userID: user.uid,
        description: "",
      });
      window.location.href = "/profile";
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  } else {
    console.error("User is not authenticated");
  }
};