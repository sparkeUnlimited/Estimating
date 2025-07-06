export const sendEstimateEmail = async (data: any, _pdf: Blob) => {
  const resp = await fetch("https://api.sparkeunlimited.ca/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`API request failed: ${resp.status} ${message}`);
  }

  return resp.json();
};

export const ensureCustomerFolder = async (path: string) => {
  console.log("Ensuring folder exists:", path);
};
