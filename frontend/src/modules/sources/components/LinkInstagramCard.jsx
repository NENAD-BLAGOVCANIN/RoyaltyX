import { useEffect } from "react";
import { appUrl, instagramClientId } from "../../common/api/config";
import instagramLogo from "../../common/assets/img/platform_logos/instagram.webp";
import { Typography, Card, Button, Grid, Box } from "@mui/material";
import { requestAccessTokenFromInstagram } from "../api/instagram";

const openInstagramOAuthPopup = () => {
    
  const redirectUri = `${appUrl}/instagram-oauth-callback`;

  const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";
  const state = "instagram-oauth";
  const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
  
  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    oauthUrl,
    "InstagramOAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

export const LinkInstagramCard = ({ createSource }) => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.source === "instagram-oauth" && event.data.code) {
        const authCode = event.data.code;
        const tokenData = await requestAccessTokenFromInstagram(authCode);
        const expiresAt = Date.now() + tokenData.expires_in * 1000;        
        const source = {
          account_name: "Account Name",
          platform: "instagram",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(expiresAt).toISOString(),
        };
        try {
          await createSource(source);
        } catch (error) {
          console.error("Error creating data source:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2, height: "100%", mt: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box>
            <img
              src={instagramLogo}
              alt="Instagram Logo"
              style={{ height: "70px", objectFit: "contain", marginBottom: 10 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Instagram
            </Typography>
            <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
              Connect your Instagram account to analyze post performance, audience
              engagement, and optimize your social media strategy.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={openInstagramOAuthPopup}
            fullWidth
          >
            Link Instagram
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};
