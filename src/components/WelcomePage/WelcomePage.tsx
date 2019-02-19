import React, { Fragment } from 'react';
import { TextField, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import logo from '../../img/logo.svg';
import { connect } from 'react-redux';
import { updateEpToken } from '../../redux/actions';

export interface WelcomePageProps {
  classes: {
    textInput: string,
  },
  dispatchEpTokenUpdate: (epToken: string) => void,
}
 
export interface WelcomePageState {
  epTokenError: boolean,
}

const styles = {
  textInput: {
    color:'white',
    width: '200px',
  },
}
 
class WelcomePage extends React.Component<WelcomePageProps, WelcomePageState> {

  state = {
    epTokenError: false,
  }

  parseTokenAndStart = () => {
    const elem: any = document.getElementById('token-holder')
    if(elem.value !== '') {
      this.props.dispatchEpTokenUpdate(elem.value);
    } else {
      this.setState({
        epTokenError: true,
      })
    }

  }

  render() { 

    const { classes } = this.props;
    const { epTokenError } = this.state;

    return (
      <Fragment>
        <div><img src={logo} className="kaaiot_logo"/></div>
        <h1 style={{textAlign: 'center'}}>Welcome to the Web Thermostat Simulator</h1>
        <span style={{color: 'gray'}}>What is this?</span>
        <p>This is a web-based thermostat simulator for the KaaIoT Building Management System.</p>
        <div className="first_steps_div">
          <p>1. Create a token in the <a href="https://www.kaaproject.org/kaa-enterprise-demo/">Building Management System</a>.</p>
          <p>2. Enter your token below to start the simulation: </p>
          <div style={{textAlign: 'center'}}>
            <TextField
              required
              error={epTokenError}
              id="token-holder"
              label="your token"
              placeholder="e.g. 'LR79PKuBDk'"
              className="token-holder"
              style={{textAlign: 'left'}}
              InputProps={{
                classes: {
                  input: classes.textInput,
                },
              }}
              InputLabelProps={{
                classes: {
                  root: classes.textInput,
                  focused: classes.textInput,
                }
              }}
            />
          </div>
        </div>
        
        <Button variant="contained" color="primary" style={{marginTop: 20}} onClick={this.parseTokenAndStart}>
          Get Started
        </Button>
      </Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  dispatchEpTokenUpdate: (epToken: string) => dispatch(updateEpToken(epToken)),
})

export default connect(null, mapDispatchToProps)(withStyles(styles)(WelcomePage));