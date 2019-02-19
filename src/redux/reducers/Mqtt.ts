import { MQTT_CLIENT_UPDATE } from "../actionTypes";
import { MqttClient } from "mqtt";


type MqttState = {
  mqttClient?: MqttClient,
}

const initialState: MqttState = {
};

export default function(state = initialState, action: { type: string, payload: MqttClient}) {
  switch (action.type) {
    case MQTT_CLIENT_UPDATE: {
      return {
        mqttClient: action.payload
      };
    }
    default:
      return state;
  }
}
