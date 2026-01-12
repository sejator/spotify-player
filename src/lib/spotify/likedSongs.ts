import type { SpotifyPlaylist } from "@/types/spotify.type";

export const LIKED_SONGS_URI = "spotify:collection:tracks";

export const likedSongsPlaylist: SpotifyPlaylist = {
  id: "liked-songs",
  name: "Liked Songs",
  description: "Koleksi lagu yang kamu sukai",
  uri: LIKED_SONGS_URI,
  images: [
    {
      url: "/images/liked-songs.png",
      width: 300,
      height: 300,
    },
  ],
};
