export function parsehomeTrustedLogoListOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || '',
    errorDescription: rawJson?.errorDescription || '',
    errorNo: rawJson?.errorNo || 0,
    homeTrustedLogoList:
      rawJson?.homeTrustedLogoList ||
      rawJson?.HomeTrustedLogoList ||
      rawJson?.data ||
      [],
    rawData: rawJson
  };
}

export function parsehomeTrustedLogoListErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status, 
    message: rawJson?.message || 'Failed to load trusted logo list',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    errorNo: rawJson?.errorNo || status,
    homeTrustedLogoList: [],
    rawData: rawJson
  };
}

export const parseHomeTrustedLogoListOutput = parsehomeTrustedLogoListOutput;

