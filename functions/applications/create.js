import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      ...data,
      userId: event.requestContext.identity.cognitoIdentityId,
      sk: `${event.pathParameters.courseId}#application-${uuid.v1()}`,
      createdAt: Date.now()
    }
  };

  // todo: check if courseId belongs to current user

  try {
    await dynamoDbLib.call("put", params);
    const item = {
      ...params.Item,
      courseId: params.Item.sk.split('#')[0],
      applicationId: params.Item.sk.split('#')[1].substring('application-'.length)
    };
    return success(item);
  } catch (e) {
    return failure({ status: false });
  }
}