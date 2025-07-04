export const sendEstimateEmail = async (data: any, pdf: Blob) => {
  console.log("Sending estimate email...", data, pdf);
};

export const ensureCustomerFolder = async (path: string) => {
  console.log("Ensuring folder exists:", path);
};
