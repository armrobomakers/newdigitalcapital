const confirmedLegalOperator = {
  name: "ООО «Родственные Души»",
  inn: "7733390668",
  address: "125424, город Москва, Волоколамское ш., д. 108, помещ. 8Ц, комн. 5, офис 8А",
};

export const legalConfig = {
  operatorName:
    process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME?.trim() || confirmedLegalOperator.name,
  operatorInn: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_INN?.trim() || confirmedLegalOperator.inn,
  operatorAddress:
    process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS?.trim() || confirmedLegalOperator.address,
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
