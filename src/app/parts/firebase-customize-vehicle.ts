import { User } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import ClientErrorToaster from "./ClientErrorToaster"; // Import toaster
import { storage } from "./firebase";

/**
 * Uploads a photo to Firebase Storage for a specific vehicle.
 * The user must be authenticated and passed as the `user` argument.
 */
export const uploadPhoto = async (file: File, user: User, carid: string): Promise<string> => {
    if (!file) throw new Error("No file provided.");
    if (!user) throw new Error("User is not authenticated. Please log in.");
    if (!carid) throw new Error("Car ID is not provided.");

    const storageRef = ref(storage, `vehicles/${carid}/backgroundPic`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress.toFixed(0)}% done`);
            },
            (error) => {
                console.error("Upload failed", error);
                window.dispatchEvent(
                  new CustomEvent("show-global-error", { detail: "Upload failed: " + error.message })
                );
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error: any) {
                    window.dispatchEvent(
                      new CustomEvent("show-global-error", { detail: "Failed to get download URL: " + error.message })
                    );
                    reject(error);
                }
            }
        );
    });
};

function validatePhotoUploadInputs(file: File, user: User, carid: string): void {
    if (!file) throw new Error("No file provided.");
    if (!user) throw new Error("User is not authenticated. Please log in.");
    if (!carid) throw new Error("Car ID is not provided.");
}

export const letsAddPhoto = async (file: File, user: User, carid: string): Promise<string> => {
    validatePhotoUploadInputs(file, user, carid);

    const timestamp = Date.now();
    // Allow all file extensions, not just jpg
    const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : "";
    const fileName = ext ? `${timestamp}-${uuidv4()}.${ext}` : `${timestamp}-${uuidv4()}`;
    const storageRef = ref(storage, `vehicles/${carid}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise<void>((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            undefined,
            (error) => {
                window.dispatchEvent(
                  new CustomEvent("show-global-error", { detail: "Upload failed: " + error.message })
                );
                reject(error);
            },
            () => resolve()
        );
    });

    try {
        return await getDownloadURL(storageRef);
    } catch (error: any) {
        window.dispatchEvent(
          new CustomEvent("show-global-error", { detail: "Failed to get download URL: " + error.message })
        );
        throw error;
    }
};

// Export toaster for use in your app layout if needed
export { ClientErrorToaster };
