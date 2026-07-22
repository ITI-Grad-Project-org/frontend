export const profileSetupFlagKey = "just_registered";

export function isProfileSetupFlowActive(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return sessionStorage.getItem(profileSetupFlagKey) === "true";
}

export function markProfileSetupFlowActive() {
    sessionStorage.setItem(profileSetupFlagKey, "true");
}

export function clearProfileSetupFlowFlag() {
    sessionStorage.removeItem(profileSetupFlagKey);
}
