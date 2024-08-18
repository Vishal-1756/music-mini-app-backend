import axios from "axios";
import config from "../../config.js";

async function fetchProfilePhoto(userId) {
  const botToken = config.bot_token;
  if (!botToken) {
    throw new Error("Bot token is missing in the config");
  }

  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}`
    );

    const data = response.data;
    if (data.ok && data.result.total_count > 0) {
      const photo = data.result.photos[0][0];
      const fileResponse = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${photo.file_id}`
      );
      const fileData = fileResponse.data;
      if (fileData.ok) {
        return `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
      }
    }
  } catch (error) {
    console.error("Error fetching profile photo:");
  }
  // return "https://i.pinimg.com/564x/68/90/dd/6890dd71a7acd7422caded4b4ed0f07a.jpg";
  return "https://te.legra.ph/file/46dba73820f15596c3fab.png";
}

export default fetchProfilePhoto;