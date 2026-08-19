import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/query-client.ts";
import { GOOGLE_CLIENT_ID } from "./lib/google-oauth.ts";

const app = (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider
        clientId={GOOGLE_CLIENT_ID}
        locale="en"
        onScriptLoadError={() =>
          toast.error("Google sign-in failed to load. Please try again.")
        }
      >
        {app}
      </GoogleOAuthProvider>
    ) : (
      app
    )}
  </StrictMode>
);
