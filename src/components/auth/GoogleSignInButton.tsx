import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { GOOGLE_CLIENT_ID } from "@/lib/google-oauth";

type GoogleSignInButtonProps = {
  onSuccess: (idToken: string) => void;
  onError?: () => void;
};

function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const rootRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = Math.max(el.clientWidth, 200);
      setButtonWidth((prev) => (prev === width ? prev : width));
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div ref={rootRef} className="space-y-4 my-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center">
        {buttonWidth === null ? (
          <div className="h-10" />
        ) : (
          <GoogleLogin
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="continue_with"
            width={buttonWidth}
            onSuccess={(credentialResponse) => {
              const credential = credentialResponse.credential;
              if (!credential) {
                onErrorRef.current?.();
                return;
              }
              onSuccessRef.current(credential);
            }}
            onError={() => {
              onErrorRef.current?.();
              toast.error("Google sign-in was cancelled or failed. Please try again.");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default GoogleSignInButton;
