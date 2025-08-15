import { useEffect } from "react";

export const InstagramOAuthCallback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");

    if (code && window.opener) {
      // Send code to main window
      window.opener.postMessage(
        { source: "instagram-oauth", code },
        window.location.origin // Or "*" if you need to support multiple origins
      );
      window.close();
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Processing OAuth Code...</h1>
    </div>
  );
};
