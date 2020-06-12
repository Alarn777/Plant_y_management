import { combineReducers } from "redux";
import { LOCATION_CHANGE } from "react-router-redux";

const INITIAL_STATE = {
  plantyData: []
};

const cleanerReducer = (state = INITIAL_STATE, action) => {
  const { myCognitoUser, avatarUrl, plantsImages, streamUrl } = state;

  switch (action.type) {


    case "CLEAN_STATE":
      return {
        streamUrl: null,
        plantsImages: [],
        avatarUrl: "",
        myCognitoUser: myCognitoUser
      };

    case "ADD_STREAM_URL":
      return {
        streamUrl: action.payload,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        myCognitoUser: myCognitoUser
      };

    case "ADD_IMAGE":
      let newArr = [];
      if (!plantsImages) {
        newArr = [];
      } else {
        newArr = plantsImages;
      }

      if (
        newArr.indexOf(c => {
          return c.name === action.payload.name;
        }) < 0
      ) {
        newArr.push(action.payload);
      }
      return {
        streamUrl: streamUrl,
        plantsImages: newArr,
        avatarUrl: avatarUrl,
        myCognitoUser: myCognitoUser
      };

    case "ADD_USER":
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        myCognitoUser: action.payload
      };

    case "ADD_AVATAR_LINK":
      return {

        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: action.payload,
        myCognitoUser: myCognitoUser
      };

    case "FETCH_POST":
      return {
        streamUrl: streamUrl,
        planters: action.payload.Items,
        myCognitoUser: action.payload
      };

    case "LOAD_PLANTERS":
      return state;

    default:
      return state;
  }
};

const manualCategories = (state = [], action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
    default:
      return state;
  }
};

export default combineReducers({
  plantyData: cleanerReducer,
  routerReducer: manualCategories
});
