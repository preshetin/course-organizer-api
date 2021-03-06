import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    KeyConditionExpression: "userId = :userId AND begins_with(sk,:coursePrefix)",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId,
      ":coursePrefix": "course-"
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    const items = result.Items.map(item => ({
      ...item,
      courseId: item.sk.substring('course-'.length)
    }));
    return success(items);
  } catch (e) {
    return failure({ status: false });
  }
}