import axios from "axios";

async function fetchProfilePhoto(userName) {
  if (!userName) {
    throw new Error("Username is missing");
  }

  try {
    const profilePhotoUrl = `https://t.me/i/userpic/160/${userName}.jpg`;
    const response = await axios.get(profilePhotoUrl);

    if (response.status === 200) {
      return profilePhotoUrl;
    }
  } catch (error) {
    console.error("Error fetching profile photo:", error);
  }

  return "https://te.legra.ph/file/46dba73820f15596c3fab.png";
}

export default fetchProfilePhoto;
