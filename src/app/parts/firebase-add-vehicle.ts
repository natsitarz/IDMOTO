//Pass form to firebase 
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const firebaseAddVehiclePublic = async (
  formData: FormData, 
  router?: { push: (url: string) => void }
) => {
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
      
      // Use router if provided, otherwise fallback to window.location.href
      if (router) {
        router.push(`/profile?uid=${user.uid}`);
      } else {
        window.location.href = "/profile?uid=" + user.uid;
      }
      
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Successfully added a car.",
        })
      );
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  } else {
    console.error("User is not authenticated");
  }
};