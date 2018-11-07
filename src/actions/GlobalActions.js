export const set_measures = (measures) => dispatch => {
    dispatch({
        type: 'SET_MEASURES',
        measures: measures,
    })
};