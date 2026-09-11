export function buildhomeTrustedLogoListInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}

export const buildHomeTrustedLogoListInput = buildhomeTrustedLogoListInput;