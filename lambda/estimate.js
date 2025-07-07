export const handler = async (event) => {
  const AWS = (await import("aws-sdk")).default;
  const { v4: uuidv4 } = await import("uuid");

  const dynamo = new AWS.DynamoDB.DocumentClient();
  const ses = new AWS.SES({ region: "us-east-1" });

  let body;

  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || event;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON in request body." }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }

  const customerData = body.customer || {};
  const estimateData = body.estimate || {};

  const requiredFields = ["fullName", "email", "address"];
  const missing = requiredFields.filter((f) => !customerData?.[f]);

  if (missing.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Missing required fields: ${missing.join(", ")}` }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }

  const year = new Date().getFullYear();
  const customerID = `CUS-${year}-${uuidv4().slice(0, 8).toUpperCase()}`;
  const estimateID = `EST-${year}-${uuidv4().slice(0, 8).toUpperCase()}`;

  const customerItem = {
    CustomerID: customerID,
    Timestamp: new Date().toISOString(),
    ...customerData,
  };

  const estimateItem = {
    EstimateID: estimateID,
    CustomerID: customerID,
    Timestamp: new Date().toISOString(),
    ...estimateData,
  };

  try {
    await dynamo.put({ TableName: "Customers", Item: customerItem }).promise();
    await dynamo.put({ TableName: "EstimateDetails", Item: estimateItem }).promise();

    await ses
      .sendEmail({
        Destination: { ToAddresses: [customerData.email] },
        Message: {
          Body: {
            Text: {
              Data: `Hi ${customerData.fullName},\n\nThanks for your submission. Your Customer ID is ${customerID}.`,
            },
          },
          Subject: { Data: "Submission Received" },
        },
        Source: "info@sparkeunlimited.ca",
        ReplyToAddresses: ["rmaxwell@sparkeunlimited.ca"],
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success", customerID, estimateID }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: err.message }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
