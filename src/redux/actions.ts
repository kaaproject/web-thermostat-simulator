import { EpMetadata } from "../kaa/schemas/Types";
import { METADATA_UPDATE, EP_TOKEN_UPDATE, MQTT_CLIENT_UPDATE } from "./actionTypes";
import { MqttClient } from "mqtt";

export const updateMetadata = (epMetadata: EpMetadata) => ({
  type: METADATA_UPDATE,
  payload: epMetadata
});

export const updateEpToken = (epToken: string) => ({
  type: EP_TOKEN_UPDATE,
  payload: epToken
});

export const updateMqttClient = (mqttClient: MqttClient) => ({
  type: MQTT_CLIENT_UPDATE,
  payload: mqttClient
});