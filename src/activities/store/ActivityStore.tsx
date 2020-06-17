import { createStore } from 'redux';

var initialState = {
    activity: [],
    menu: null
}


const ActionTypes = {
    'GET_Acitivity': 'GET_Acitivity',
    'GET_Menu': 'GET_Menu'
}

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case ActionTypes.GET_Acitivity:
            return {
                ...state,
                activity: action.activity
            };
            case ActionTypes.GET_Menu:
                return {
                    ...state,
                    menu: action.menu
                };
        default:
            return state;
    }

}
let ActivityStore = createStore(reducer, initialState);

export { ActivityStore, ActionTypes }
