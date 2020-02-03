import { success, failure } from "../../libs/response-lib";
import { sendRoute } from '../../libs/mailer-lib';

export const main = async (event, context) => {
  console.log("processing queue message...", JSON.stringify(event));

  const data = JSON.parse(event.Records[0].body);

  switch (data.status) {
    case "routeSent":
      try {
        // send 'routeSent' email
        await sendRoute(data);

        // todo: add record with mail log

        return success({ status: true });
      } catch (e) {
        console.log('error', e);
        return failure({ success: false });
      }
    default:
      break;
  }
};
