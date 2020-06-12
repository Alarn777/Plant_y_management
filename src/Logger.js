import { Storage } from "aws-amplify";

export class Logger {
  static saveLogs(username, string, origin) {
    let dateString = new Date()
      .toISOString()
      .toString()
      .slice(0, -5);

    let fileName = "log_" + dateString;

    let body = {
          timestamp: dateString,
          error: string,
          origin: origin,
          username: username
    }
    body = JSON.stringify(body)

    Storage.put(
      'Admins/' + username + "/Logs/" + fileName + ".json",
        body,
      {
        contentType: "json",
        level: "public"
      }
    )
      .then(r => {
          // console.log(r)
      })
      .catch(e => {
          console.log('error in put logs',e)
      });
  }
}
