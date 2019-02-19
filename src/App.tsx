import React, {Component, Fragment} from 'react';
import Slider from '@material-ui/lab/Slider';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {MdLens} from "react-icons/md";
import * as _ from 'lodash';
import * as messages from './constants/messages';

import './App.css';
import './css/main.css'
import ThermostatImproved from './components/ThermostatImproved';
import {EpMetadata} from './kaa/schemas/Types';
import * as MqttUtils from './kaa/mqtt/MqttUtils';

import {GiDrop, GiSpeedometer} from "react-icons/gi";
import {FiExternalLink} from "react-icons/fi";
import MetadataHolder from './components/MetadataHolder/MetadataHolder';
import WelcomePage from './components/WelcomePage/WelcomePage';
import {getEpToken} from './redux/selectors/Endpoint';
import {connect} from 'react-redux';
import {
  Fab,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@material-ui/core';
import {MqttClient} from 'mqtt';
import {getMqttClient} from './redux/selectors/Mqtt';
import {updateMetadata} from './redux/actions';

type AProps = {
  classes: {
    slider: string,
    thumb: string,
    secondaryTimeseries: string,
  },
  epToken: string,
  mqttClient?: MqttClient,
  dispatchMetadataUpdate?: (epMetadata: EpMetadata) => void,
}

type AState = {
  desiredTemp: number,
  humidity: number,
  pressure: number,
  currentTemp: number,
  epMetadata: EpMetadata | any,
  epMetadataNonSaved?: EpMetadata,
  isSnackBarShown: boolean,
  isMetadataEditShown: boolean,
  snackBarMessage?: string,
  isConnected: boolean,
}

const styles = {
  root: {
    width: 300,
  },
  slider: {
    color: 'white',
    backgroundColor: 'white',
  },
  thumb: {
    backgroundColor: 'white',
  },
  secondaryTimeseries: {
    container: {
      display: 'flex',
      flexDirection: 'row' as 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginTop: '50px'
    },
    tsBox: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      margin: '0 20px',
      width: '95px',
      fontSize: '16pt',
    }
  }
};

class App extends Component<AProps, AState> {

  state: AState = {
    desiredTemp: 10,
    currentTemp: 10,
    humidity: 0,
    pressure: 0,
    epMetadata: {},
    isSnackBarShown: false,
    isMetadataEditShown: false,
    isConnected: false,
  };

  onTimeseriesUpdated = (humidity: number, pressure: number) => {
    this.setState({
      humidity: humidity,
      pressure: pressure,
    })
  };

  onSetPointUpdated = (setPoint: number) => {
    this.setState({
      desiredTemp: setPoint,
    });
    this.toggleSnackBarShownState(true, messages.SETPOINT_WAS_UPDATED);
  };

  onEpMetadataUpdated = (metadata: EpMetadata, isUpdateFromServer: boolean) => {
    if (!_.isEqual(_.omit(metadata, ['connectivity_ts']), _.omit(this.state.epMetadata, ['connectivity_ts']))) {
      if (!isUpdateFromServer) {

      }
      this.setState({
        epMetadata: metadata,
      });
      this.toggleSnackBarShownState(true, messages.METADATA_WAS_UPDATED);
    }
  };

  setConnectedStatus = (status: boolean) => {
    this.setState({
      isConnected: status,
    })
  };

  sendUpdatedMetadataToKaa = () => {
    const newMetadata = _.merge({}, this.state.epMetadata, this.state.epMetadataNonSaved);
    MqttUtils.sendMetadata(this.props.mqttClient!, this.props.epToken, newMetadata);
    this.props.dispatchMetadataUpdate!(newMetadata);
    this.hideMetadata();
  };

  updateEpMetadadaNonSaved = (updated: any) => {
    this.setState({
      epMetadataNonSaved: updated,
    })
  };

  handleSnackBarClose = () => {
    this.toggleSnackBarShownState(false);
  };

  toggleSnackBarShownState = (isSnackBarShown: boolean, message?: string) => {
    this.setState({
      isSnackBarShown: isSnackBarShown,
      snackBarMessage: message,
    })
  };

  renderSnackBar = () => {
    const {isSnackBarShown, snackBarMessage} = this.state;
    return (<Snackbar
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      open={isSnackBarShown}
      autoHideDuration={6000}
      onClose={this.handleSnackBarClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      style={{left: 'inherit', margin: '20px', borderRadius: '10px'}}
      message={<span id="message-id">{snackBarMessage}</span>}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={this.handleSnackBarClose}
        >
          <CloseIcon/>
        </IconButton>,
      ]}
    />);
  };

  renderEnterTokenContent = () => {
    const {classes} = this.props;

    return (
      <WelcomePage
        // onEpTokenUpdated={this.onEpTokenUpdated}
      />
    )
  };

  renderThermostatConnectivityStatus = () => {
    const {isConnected} = this.state;

    return (
      <Tooltip title={isConnected ? 'online' : 'offline'} placement='top' style={{marginRight: 10}}>
        <MdLens size="10" color={isConnected ? 'green' : 'red'}/>
      </Tooltip>
    )
  };

  renderThermostatContent = () => {
    const {classes} = this.props;
    const {desiredTemp, humidity, pressure} = this.state;

    return (
      <Fragment>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {this.renderThermostatConnectivityStatus()}<h1>Thermostat</h1><FiExternalLink size={20}
                                                                                        onClick={() => window.open('https://building.kaaiot.net/thermostats/', "_blank")}
                                                                                        style={{
                                                                                          marginLeft: '10px',
                                                                                          cursor: 'pointer'
                                                                                        }}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <ThermostatImproved
            styles={{
              width: '300px',
              marginBottom: 30,
            }}
            desiredTemp={desiredTemp}
            minValue={0}
            maxValue={50}
            onTimeseriesUpdatedHandler={this.onTimeseriesUpdated}
            onSetPointUpdated={this.onSetPointUpdated}
            onEpMetadataUpdated={this.onEpMetadataUpdated}
            onConnectivityStatusChange={this.setConnectedStatus}
          />


          <Slider
            classes={{track: classes.slider, thumb: classes.thumb}}
            value={desiredTemp}
            aria-labelledby="label"
            step={1}
            max={50}
            onChange={(event, value) => {
              this.setState({desiredTemp: value})
            }}
          />
        </div>
        <div style={styles.secondaryTimeseries.container}>
          <Tooltip title="Humidity" placement='top'>
            <div style={styles.secondaryTimeseries.tsBox}>
              <GiDrop size="30"/>
              <span>{humidity}%</span>
            </div>
          </Tooltip>
          <Tooltip title="Air pressure" placement='top'>
            <div style={styles.secondaryTimeseries.tsBox}>
              <GiSpeedometer size="30"/>
              <span>{pressure} mbar</span>
            </div>
          </Tooltip>

        </div>
        {this.renderSnackBar()}
      </Fragment>);
  };

  hideMetadata = () => {
    this.setState({isMetadataEditShown: false})
  };

  renderMetadataContent = () => {

    const {epMetadata, isMetadataEditShown} = this.state;

    return (

      <Dialog open={isMetadataEditShown} onClose={this.hideMetadata} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Metadata</DialogTitle>
        <DialogContent style={{overflowY: 'scroll'}}>
          <DialogContentText>
            Here you can edit <a style={{color: 'black'}}
                                 href="https://github.com/kaaproject/kaa-rfcs/blob/master/0010/README.md">the thermostat
            attributes</a>. Updated values will be uploaded to the platform immediately, so you can see them in the BMS.
          </DialogContentText>
          <MetadataHolder
            onEpMetadataUpdated={this.onEpMetadataUpdated}
            epMetadata={epMetadata}
            onEpMetadataNonSavedUpdated={this.updateEpMetadadaNonSaved}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.hideMetadata} color="primary">
            Cancel
          </Button>
          <Button onClick={this.sendUpdatedMetadataToKaa} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  renderFab = () => (
    <Fab color="secondary" aria-label="Edit"
         style={{position: 'absolute', right: 0, bottom: 0, margin: '20px'}}
         onClick={() => {
           this.setState({
             isMetadataEditShown: true,
           })
         }}
      // className={classes.fab}
    >
      <Icon>edit_icon</Icon>
    </Fab>
  );


  render() {

    const {epToken} = this.props;
    const {isMetadataEditShown} = this.state;

    return (
      <Fragment>
        <div className="App">

          {!epToken && this.renderEnterTokenContent()}
          {epToken && this.renderThermostatContent()}
          {epToken && this.renderFab()}

        </div>
        {this.renderMetadataContent()}
      </Fragment>

    );
  }
}

const mapStateToProps = (state: any) => ({
  epToken: getEpToken(state),
  mqttClient: getMqttClient(state),
});

const mapDispatchToProps = (dispatch: any) => ({
  dispatchMetadataUpdate: (epMetadata: EpMetadata) => dispatch(updateMetadata(epMetadata))
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App));
