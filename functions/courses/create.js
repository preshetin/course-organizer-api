import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      sk: `course-${uuid.v1()}`,
      description: data.description,
      startDate: data.startDate,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    const item = {
      ...params.Item,
      courseId: params.Item.sk.substring('course-'.length)
    };
    return success(item);
  } catch (e) {
    return failure({ status: false });
  }
}