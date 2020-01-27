import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);

  const courseId = '6040d380-40de-11ea-aa37-831e6e8e2845'; // dev, 2 feb one day

  const params = {
    TableName: process.env.tableName,
    Item: {
      ...data,
      userId: data.userId,
      sk: `${courseId}#application-${uuid.v1()}`,
      createdAt: Date.now()
    }
  };

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