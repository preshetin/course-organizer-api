import uuid from "uuid";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);

  const upcomingCourseId = process.env.upcomingCourseId;

  const params = {
    TableName: process.env.tableName,
    Item: {
      ...data,
      autoVechileDetails: data.autoVechileDetails || null,  //todo check for empty strings everywhere
      userId: data.userId,
      sk: `${upcomingCourseId}#application-${uuid.v1()}`,
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
    console.log('error', e);
    return failure({ status: false });
  }
}