import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      sk: `${event.pathParameters.courseId}#application-${event.pathParameters.applicationId}`,
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      const item = {
        ...result.Item,
        courseId: result.Item.sk.split('#')[0],
        applicationId: result.Item.sk.split('#')[1].substring('application-'.length)
      };
      return success(item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    return failure({ status: false });
  }
}
