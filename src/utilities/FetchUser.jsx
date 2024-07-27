
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase-client/config";

export const fetchUserData = async (userId, setUserInfo, setLoading) => {
  if (userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserInfo(data);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      if (setLoading) setLoading(false);
    }
  }
};
