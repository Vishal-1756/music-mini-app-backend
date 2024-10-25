import * as cheerio from "cheerio";
// import ytdl from "ytdl-core";
import axios from "axios";

const getAUdioUrl = async (video_id) => {
  try {
    const res = await fetch("https://y2meta.app/downloader/ajax", {
      headers: {
        accept: "*/*",
        "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="117", "Not;A=Brand";v="8"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        Referer: "https://y2meta.app/en31/download-youtube",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${video_id}&q_auto=0&ajax=1&token=d8dd86b135032bf030191874b42a9ea2dc4558090dfb5953269fb2ca8e48a41c`,
      method: "POST",
    });

    const data = await res.json();
    const html = data.result;
    const $ = cheerio.load(html);

    // Select the script tag containing the variables
    const scriptContent = $("script").last().html();

    // Extract values using regular expressions
    const v_id = scriptContent.match(/var k_data_vid = "(.*?)";/)[1];
    const k_convert_url = scriptContent.match(
      /var k_convert_url = "(.*?)";/
    )[1];
    const token = scriptContent.match(/var k__id = "(.*?)";/)[1];
    const timeExpire = scriptContent.match(/var k_time = "(.*?)";/)[1];
    const client = "Y2meta.app";
    const ftype = "mp3";

    const anchorText = $("tbody#mp3-body > tr:first-child > td:first-child > a")
      .text()
      .trim();
    const match = anchorText.match(/\((\d+)kbps\)/);
    const fquality = match ? parseInt(match[1]) : 64;

    // Log the extracted values
    const body = {
      v_id,
      token,
      timeExpire,
      fquality,
      ftype,
      client,
    };

    const downloadRes = await fetch(k_convert_url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="117", "Not;A=Brand";v="8"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-requested-key": "de0cfuirtgf67a",
        Referer: "https://y2meta.app/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      method: "POST",
      body: new URLSearchParams(body),
    });

    const downloadUrl = await downloadRes.json();
    return downloadUrl.d_url;
  } catch (error) {
    throw new ApiError(500, "Error while fetching audio url");
  }
};

// const fetchSong = async (query) => {
//   const response = await axios.get(
//     `https://pipedapi.kavin.rocks/search?filter=videos&q=${query}`
//   );
//   const data = response.data?.items;
//   if (!data) return new ApiError(404, "No results found");

//   const video = data[0];
//   const { title, url, thumbnail, uploaderName } = video;
//   const video_id = url.trim().replace("/watch?v=", "");
//   const audioUrl = await getAUdioUrl(video_id);

//   const jsonData = {
//     singer: uploaderName,
//     song_name: title,
//     url: audioUrl,
//     image: thumbnail,
//   };
//   return jsonData;
// };

const fetchSong = async (query) => {
  let info = {};
  const response = await axios.get(
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${query}`
  );
  const data = response.data.data.results[0];
  info.song_name = data.name;
  info.singer = data.primaryArtists;
  info.image = data.image[data.image.length - 1].link;
  info.url = data.downloadUrl.find(url => url.quality === "96_KBPS").link;
  return info;
};

export default fetchSong;
