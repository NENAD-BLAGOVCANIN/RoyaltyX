import { GoogleOAuthCallback } from "./pages/GoogleOAuthCallback";
import { InstagramOAuthCallback } from "./pages/InstagramOAuthCallback";
import { TikTokOAuthCallback } from "./pages/TikTokOAuthCallback";
import { TwitchOAuthCallback } from "./pages/TwitchOAuthCallback";
import { VimeoOAuthCallback } from "./pages/VimeoOAuthCallback";

const oauthRoutes = [
  {
    path: "/google-oauth-callback",
    element: <GoogleOAuthCallback />,
  },
  {
    path: "/instagram-oauth-callback",
    element: <InstagramOAuthCallback />,
  },
  {
    path: "/tiktok-oauth-callback",
    element: <TikTokOAuthCallback />,
  },
  {
    path: "/twitch-oauth-callback",
    element: <TwitchOAuthCallback />,
  },
  {
    path: "/vimeo-oauth-callback",
    element: <VimeoOAuthCallback />,
  },
];

export default oauthRoutes;
