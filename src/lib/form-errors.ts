type FormErrorNode = {
    message?: unknown;
    [key: string]: unknown;
};

function isFormErrorNode(value: unknown): value is FormErrorNode {
    return typeof value === "object" && value !== null;
}

export function getFirstFormErrorMessage(errors: unknown): string | null {
    if (!isFormErrorNode(errors)) {
        return null;
    }

    if (typeof errors.message === "string" && errors.message.trim()) {
        return errors.message;
    }

    for (const value of Object.values(errors)) {
        const message = getFirstFormErrorMessage(value);

        if (message) {
            return message;
        }
    }

    return null;
}
