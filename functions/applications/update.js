import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

import AWS from "aws-sdk";
var sqs = new AWS.SQS();


export async function main(event, context) {
  const data = JSON.parse(event.body);
  const getParams = getGetParams(process.env.tableName, event);
  const updateParams = getUpdateParams(process.env.tableName, event, data);

  try {
    // get item
    const resultGet = await dynamoDbLib.call("get", getParams);
    let item = null;
    if (resultGet.Item) {
      item = {
        ...resultGet.Item,
        courseId: resultGet.Item.sk.split('#')[0],
        applicationId: resultGet.Item.sk.split('#')[1].substring('application-'.length)
      };
    }

    await dynamoDbLib.call("update", updateParams);

    if (item && item.status && item.status !== data.status) {
      // publish notification with old and new status
      console.log('sending message to StatusChange queue....', data.status);
      const queueUrl = process.env.queueUrl;
      const queueParams = {
        MessageBody: JSON.stringify({
          ...data,
          userId: event.requestContext.identity.cognitoIdentityId,
          courseId:  event.pathParameters.courseId,
          applicationId: event.pathParameters.courseId
        }),
        QueueUrl: queueUrl
      };
      await sqs.sendMessage(queueParams).promise();
    }

    return success({ status: true });
  } catch (e) {
    return failure({ status: false, e });
  }
}

function getGetParams(TableName, event) {
  const params = {
    TableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      sk: `${event.pathParameters.courseId}#application-${event.pathParameters.applicationId}`,
    }
  };
  return params;
}

function getUpdateParams(TableName, event, data) {
  const params = {
    TableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      sk: `${event.pathParameters.courseId}#application-${event.pathParameters.applicationId}`
    },
    UpdateExpression: "SET firstName = :firstName, #application_status = :status, email = :email",
    ExpressionAttributeNames: {
      "#application_status": "status"
    },
    ExpressionAttributeValues: {
      ":firstName": data.firstName || null,
      ":status": data.status || null,
      ":email": data.email || null
    },
    ReturnValues: "ALL_NEW"
  };
  return params;
}
