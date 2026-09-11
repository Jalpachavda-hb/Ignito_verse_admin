/**
 * OUTPUT DTO FILE: Microcredential Watch Video Add/Update Output Parser
 * Parses response for microcredential student watch video add/update.
 */

export function parseMicroCredencialWatchvideoAddUpdateOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || 'Watch video progress updated successfully',
        errorDescription: rawJson?.errorDescription || '',
        errorNo: rawJson?.errorNo || 0,
        isSuccess: rawJson?.isSuccess ?? isHttpOk,
        rawData: rawJson
    };
}

export function parseMicroCredencialWatchvideoAddUpdateErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || 'Failed to update watch video progress',
        errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || status,
        isSuccess: false,
        rawData: rawJson
    };
}
