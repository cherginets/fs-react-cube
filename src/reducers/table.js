const initialState = {
    measures: [],
    measures_list_top: [],
    measures_list_left: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_INIT_PROPS':
            console.log('action', action)
            return {
                ...state,
                measures: action.measures,
                measures_list_top: action.measures_list_top,
                measures_list_left: action.measures_list_left,
            };
        default:
            return state
    }
};