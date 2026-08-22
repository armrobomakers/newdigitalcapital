export const legalConfig = {
  operatorName: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME?.trim() ?? "",
  operatorInn: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_INN?.trim() ?? "",
  operatorAddress: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS?.trim() ?? "",
  privacyEmail: process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL?.trim() ?? "",
};

export function isLegalConfigReady() {
  return Boolean(
    legalConfig.operatorName &&
      legalConfig.operatorInn &&
      legalConfig.operatorAddress &&
      legalConfig.privacyEmail
  );
}
