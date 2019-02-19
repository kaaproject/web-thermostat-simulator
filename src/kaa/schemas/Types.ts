export type EpConfig = {
  configId: string,
  statusCode: number,
  reasonPhrase: string,
  config: {
    referencePressure: string,
    reportingPeriod: number,
    temperatureSetpoint: string,
  }
}

export type EpMetadata = {
  connected?: boolean,
  connectivity_ts?: string,
  fwVersion: string,
  hwVersion: string,
  latitude: number,
  longitude: number,
  location: string,
  mac: string,
  name: string,
  sensorType: string,
  serial: string,
  [key: string]: any,
}

export const defaultMetadata: EpMetadata = {
  location:"Steve Flanders Sq.",
  sensorType:"MyDevice A300",
  fwVersion:'1.0',
  hwVersion: '2.0',
  longitude:-74.0060,
  latitude:40.7128,
  name:'myDevice',
  mac:"255.255.255.192",
  serial:"DS",
}