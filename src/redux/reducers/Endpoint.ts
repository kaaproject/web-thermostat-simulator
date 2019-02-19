import { EpMetadata, defaultMetadata } from "../../kaa/schemas/Types";
import { METADATA_UPDATE, EP_TOKEN_UPDATE } from "../actionTypes";


type EndpointState = {
  epMetadata: EpMetadata,
  epToken: string,
}

const initialState: EndpointState = {
  epMetadata: defaultMetadata,
  epToken: '',
};

export default function(state = initialState, action: { type: string, payload: any}) {
  switch (action.type) {
    case METADATA_UPDATE: {
      return {
        ...state,
        epMetadata: action.payload
      };
    }
    case EP_TOKEN_UPDATE: {
      return {
        ...state,
        epToken: action.payload
      }
    }
    default:
      return state;
  }
}
