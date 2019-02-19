import React, { Fragment } from 'react';
import Thermostat from 'react-nest-thermostat';
import mqtt, { MqttClient } from 'mqtt';

import * as MqttUtils from '../../kaa/mqtt/MqttUtils';
import * as messages from '../../constants/messages'
import { EpConfig, EpMetadata } from '../../kaa/schemas/Types';
import { connect } from 'react-redux';
import { getMetadata, getEpToken } from '../../redux/selectors/Endpoint';
import { updateMetadata, updateMqttClient } from '../../redux/actions';
import { Dialog, DialogTitle, DialogContent, DialogContentText, Button, DialogActions } from '@material-ui/core';


type TState = {
  ambientTemp: number,
  humidity: number,
  pressure: number,
  timer?: NodeJS.Timeout
  isOnline: boolean,
  isFailedConnecting: boolean,
}

type TProps = {
  styles?: object,
  desiredTemp: number,
  minValue: number,
  maxValue: number,
  epToken: string,
  onTimeseriesUpdatedHandler: Function,
  onSetPointUpdated: Function,
  onEpMetadataUpdated: (metadata: EpMetadata, isUpdatedFromServer: boolean) => void,
  onConnectivityStatusChange: (isConnected: boolean) => void,
  dispatchMetadataUpdate?: (epMetadata: EpMetadata) => void,
  dispatchMqttClientUpdate?: (mqttClient: MqttClient) => void,
  epMetadata?: EpMetadata,
}

class ThermostatImproved extends React.PureComponent<TProps,TState> {

  client: mqtt.MqttClient;

  constructor(props: TProps, state: TState) {
    super(props, state);
    this.client = MqttUtils.connectToThePlatform()
  }

  state: TState =  {
    ambientTemp: 10,
    humidity: 0,
    pressure: 0,
    isOnline: false,
    isFailedConnecting: false,
  }

  componentDidMount() {

    setTimeout(() => this.props.dispatchMqttClientUpdate!(this.client), 0);

    setInterval(() => {

      const { ambientTemp, humidity, pressure } = this.state;
      const { desiredTemp, epToken } = this.props;

      const newValue: number = ambientTemp > desiredTemp ? 
        ambientTemp - 1 :
        ambientTemp === desiredTemp ? 
        ambientTemp :
        ambientTemp + 1;

      const newHumidity = Math.round(Math.abs(newValue)) % 100;
      const newPressure = Math.round(1000 + Math.abs(newValue));

      this.setState({
        ambientTemp: newValue,
        humidity: newHumidity,
        pressure: newPressure,
      })

      this.props.onTimeseriesUpdatedHandler(newHumidity, newPressure);

      MqttUtils.sendTimeseries(this.client, epToken, humidity, pressure, ambientTemp);

    }, 1000)

    this.client.on('error', console.error)

    this.client.on('connect', () => {
      MqttUtils.registerMetadataListener(this.client, this.props.epToken, this.onMetadataReceived);
      setInterval(() => MqttUtils.requestAllMetadata(this.client, this.props.epToken), 1000)
      MqttUtils.subscribeToConfigs(this.client, this.props.epToken, this.onEpConfigReceived)
    })
    setTimeout(() => {
      if(!this.state.isOnline) {
        this.setState({
          isFailedConnecting: true,
        })
      }
    }, 4000)
  }

  handleThermostatIsNowOnline = () => {
    this.props.onConnectivityStatusChange(true)
    this.setState({
      isFailedConnecting: false,
      isOnline: true,
    })
  }

  chooseHvacMode = (desiredTemp: number, ambientTemp: number) => {
    if (desiredTemp === ambientTemp) {
      MqttUtils.sendACEnabledStatus(this.client, this.props.epToken, 'false');
      return "off";
    } else if (desiredTemp > ambientTemp) {
      MqttUtils.sendACEnabledStatus(this.client, this.props.epToken, 'true');
      return "heating";
    } else {
      MqttUtils.sendACEnabledStatus(this.client, this.props.epToken, 'true');
      return "cooling";
    }
  }

  onEpConfigReceived = (config: EpConfig) => {
    this.handleThermostatIsNowOnline()
    this.props.onSetPointUpdated(Number(config.config.temperatureSetpoint));
  }

  onMetadataReceived = (metadata: EpMetadata) => {
    this.handleThermostatIsNowOnline()
    let valueToSet = metadata;
    if(Object.keys(metadata).length === 2) {
      valueToSet = this.props.epMetadata!;
      MqttUtils.sendMetadata(this.client, this.props.epToken, valueToSet);
    }
    this.props.onEpMetadataUpdated(valueToSet, true);
    this.props.dispatchMetadataUpdate!(valueToSet);
  }

  renderCelsiusSign = () => {
    const { desiredTemp } = this.props;
    const { ambientTemp } = this.state;
    
    let styles: object = {position: 'absolute', color: 'white', opacity: 0.7, fontSize: '16pt', fontWeight: 'bold'};


    if ( desiredTemp === ambientTemp ) {
      styles = { display: 'none' }
    } else if ( desiredTemp <= 9 ) {
      styles = {...styles, top:'37%', right: '35%'} 
    } else if ( desiredTemp > 9 ) {
      styles = {...styles, top:'37%', right: '28%'} 
    }

    return (
      <div style={styles}>°C</div>  
    )
  }

  renderErrorConnectingDialog = () => {

    const { isFailedConnecting } = this.state;

    return(<Dialog
        open={isFailedConnecting}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{"Error on connect"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Thermostat was unable to connect to the Building Management System. Check if you entered a valid token.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => location.reload()} color="primary" autoFocus>
            Go back to welcome page
          </Button>
        </DialogActions>
      </Dialog>);
  }

  render() {

    const { ambientTemp } = this.state;
    const { desiredTemp, minValue, maxValue } = this.props;

    const hvacMode = this.chooseHvacMode(desiredTemp, ambientTemp);

    return (
      <Fragment>
        <div style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', ...this.props.styles}}>
          <Thermostat
                  away={hvacMode === 'off'}
                  ambientTemperature={ambientTemp}
                  targetTemperature={desiredTemp}
                  hvacMode={hvacMode} //"heating", "cooling", "off"
                  minValue={minValue}
                  maxValue={maxValue}
                  awayTitle={messages.THERMOSTAT_AWAY_LABEL_TEXT}
                  classes={{
                    track: {
                      color: 'white',
                    }
                  }}
                  numTicks={50}
              />
              
              {this.renderCelsiusSign()}
              {ambientTemp === desiredTemp ? null : (<div style={{position: 'absolute', marginTop: '18%', fontSize: '150%', color: 'white', opacity: 0.7}}>{messages.THERMOSTAT_DESIRED_LABEL_TEXT}</div>)}
        </div>
        {this.renderErrorConnectingDialog()}
      </Fragment>
   );
  }
}

const mapStateToProps = (state: any) => ({
  epMetadata: getMetadata(state),
  epToken: getEpToken(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  dispatchMetadataUpdate: (epMetadata: EpMetadata) => dispatch(updateMetadata(epMetadata)),
  dispatchMqttClientUpdate: (mqttClient: MqttClient) => dispatch(updateMqttClient(mqttClient)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ThermostatImproved)