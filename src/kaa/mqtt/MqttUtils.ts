import { MqttClient } from 'mqtt';
import { EpConfig, EpMetadata } from '../schemas/Types';
import mqtt from "mqtt";

export const generateMqttRequestId = () => (
  Math.round(Math.random() * 1000)
)

export const composeTimeseries = (temperature: number, humidity: number, pressure: number) => (
  JSON.stringify([{
    "timestamp": new Date().getTime(),
    "temperature": temperature,
    "humidity": humidity,
    "pressure": pressure,
  }])
)

export const composeACEnabledStatusTimeseries = (status: string) => (
  JSON.stringify(
    [{
      "ac_enabled": status,
    }]
  )
)

export const connectToThePlatform = () => mqtt.connect('wss://building.kaaiot.net:20112/ws');


export const sendTimeseries = (client: MqttClient, epToken: string, humidity: number, pressure: number, ambientTemp: number) => {

  const reqId = generateMqttRequestId();
  const dctopic = `kp1/environment-ver-1/dcx/${epToken}/json/${reqId}`

  const data = composeTimeseries(ambientTemp, humidity, pressure);

  client.publish(dctopic, data, console.log)
}

export const sendACEnabledStatus = (client: MqttClient, epToken: string, status: string) => {
  const reqId = generateMqttRequestId();
  const dctopic = `kp1/environment-ver-1/dcx/${epToken}/json/${reqId}`

  const data = composeACEnabledStatusTimeseries(status);

  client.publish(dctopic, data, (err) => {
    if(err) {
      console.log('sendACEnabledStatus: ', err)
    }
  })
}

export const registerMetadataListener = (client: MqttClient, epToken: string, onMetadataReceived: (epMetadata: EpMetadata) => void) => {
  const metadataTopic = `kp1/environment-ver-1/epmx/${epToken}/get`;
  client.on("message", (topic, payload) => {
    if(topic === `${metadataTopic}`) {
      onMetadataReceived(JSON.parse(payload.toString()));
    }
  })
}

export const requestAllMetadata = (client: MqttClient, epToken: string) => {
  const reqId = generateMqttRequestId();
  const metadataTopic = `kp1/environment-ver-1/epmx/${epToken}/get`;
  client.publish(`${metadataTopic}/${reqId}`, '{}')
}

export const sendMetadata = (client: MqttClient, epToken: string, epMetadata: EpMetadata) => {
  const metadataRequestId = generateMqttRequestId();
  const metadataTopic = `kp1/environment-ver-1/epmx/${epToken}/update/keys/${metadataRequestId}`;
  client.subscribe(`${metadataTopic}/status`, console.log)
  client.publish(metadataTopic, JSON.stringify(epMetadata), console.log)
}

export const subscribeToConfigs = (client: MqttClient, epToken: string, onConfigReceived: (config: EpConfig) => void) => {
  const configRequestId = generateMqttRequestId();
  const topicToSend = `kp1/environment-ver-1/cmx/${epToken}/config/json`;
  client.subscribe(topicToSend, (err) => {
    if(!err) {
      console.log('subscribed to configs')
      client.publish(`${topicToSend}/${configRequestId}`, JSON.stringify({}))
      client.on("message", (topic, payload) => {
        if(topic === topicToSend) {
          onConfigReceived(JSON.parse(payload.toString()));
        }
      })
    }
  })
}