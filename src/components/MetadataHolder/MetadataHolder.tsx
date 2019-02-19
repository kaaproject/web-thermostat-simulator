import React from 'react';
import { EpMetadata } from '../../kaa/schemas/Types';
import { TextField} from '@material-ui/core';
import * as _ from 'lodash';


export interface MetadataHolderProps {
  epMetadata: EpMetadata,
  onEpMetadataNonSavedUpdated: Function,
  onEpMetadataUpdated: (epMetadata: EpMetadata, isUpdateFromServer: boolean) => void,
}
 
export interface MetadataHolderState {
  epMetadataNonSaved: EpMetadata | { [index:string]: any },
  isListOpen: boolean,
  [index:string]: any,
}
 
class MetadataHolder extends React.Component<MetadataHolderProps, MetadataHolderState> {

  constructor(props: any) {
    super(props)
    this.state = {
      isListOpen: false,
      epMetadataNonSaved: {},
    }
  }
  
  handleChange = (name: string, event: any) => {
    let newValue = { [name]: event.target.value };
    const updated = { ...this.state.epMetadataNonSaved,  ...newValue};
    this.props.onEpMetadataNonSavedUpdated(updated)
    this.setState(() => ({
      epMetadataNonSaved: updated
    }));
  };

  

  render() { 
    const { epMetadata } = this.props;
    const { epMetadataNonSaved } = this.state;

     return (
      <div style={{flex: '1'}}>
          {
            Object.keys(_.omit(epMetadata, 'connected', 'connectivity_ts')).map(key => {
              return (<p>
                <TextField
                  id="token-holder"
                  label={key}
                  style={{width: '100%'}}
                  className="token-holder"
                  value={epMetadataNonSaved[key] === '' || epMetadataNonSaved[key] ? epMetadataNonSaved[key] : epMetadata[key]}
                  onChange={(event) => {
                    this.handleChange(key, event)
                   }}
                />
                
                </p>)
            })
          }
      </div>
    )
  } 
}

export default MetadataHolder;