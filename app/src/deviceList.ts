import {get as httpGet, IncomingMessage} from "http";
import {Device, DeviceList} from "../interfaces/Device";
import store from "./store";

export interface DeviceListResponse {
  created_at: number;
  devices: Device[]
}

const htmlEntities = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\''
};

function unescapeHTML(str: string): string {
  return str.replace(/&([^;]+);/g, function(entity, entityCode) {
    let match;

    if (entityCode in htmlEntities) {
      // @ts-ignore
      return htmlEntities[entityCode];
    } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
      return String.fromCharCode(parseInt(match[1], 16));
    } else if (match = entityCode.match(/^#(\d+)$/)) {
      return String.fromCharCode(~~match[1]);
    } else {
      return entity;
    }
  });
}

const exp: DeviceList = {
  createdAt: null,
  devices: [],
};

export async function fetchDevList() {

  const deviceListUrl = store.getConfig('deviceListUrl');
  const isCCU = store.getConfig('isCCU');

  if (!deviceListUrl) return;

  const url = isCCU
    ? `http://${deviceListUrl}:8181/a.exe?ret=dom.GetObject(ID_SYSTEM_VARIABLES).Get(%22AskSinAnalyzerDevList%22).Value()`
    : deviceListUrl;

  return new Promise((resolve, reject) => {
    httpGet(url, (res: IncomingMessage) => {
      res.setEncoding(isCCU ? "latin1": 'utf-8');
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = unescapeHTML(body.match(/<ret>(.+?)<\/ret>/)[1]);
        const deviceList = JSON.parse(body) as DeviceListResponse;
        exp.devices = deviceList.devices;
        exp.createdAt = deviceList.created_at * 1000;
        console.log('Fetched Device List from', deviceListUrl);
        resolve(exp);
      });
    }).on('error', e => reject(e));
  });

}

export default exp;

