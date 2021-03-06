import {PortInfo} from "serialport";

export interface Config {
  deviceListUrl: string | null,
  isCCU: boolean,
  serialPort: string | null,
  serialBaudRate: number,
  availableSerialPorts: PortInfo[],
  maxTelegrams: number,
  animations: boolean,
  persistentStorage: {
    enabled: boolean,
    keepFiles: number
  }
}
