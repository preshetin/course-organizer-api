import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "userId = :userId AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId,
      ":skPrefix": `${event.pathParameters.courseId}#application-`
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    const items = result.Items.map(item => ({
      ...item,
      courseId: item.sk.split('#')[0],
      applicationId: item.sk.split('#')[1].substring('application-'.length)
    }));
    return success(items);
  } catch (e) {
    return failure({ status: false });
  }
}