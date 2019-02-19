import { combineReducers } from "redux";
import endpoint from "./Endpoint";
import mqttState from './Mqtt';

export default combineReducers({ endpoint, mqttState });
