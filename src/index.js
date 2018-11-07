import React, {Component} from 'react';
import PropTypes from 'prop-types';

import CubeTable from "./components/CubeTable";
import CubeTopPanel from "./components/CubeTopPanel";

import { Provider } from 'react-redux'
import configureStore from './store';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint, faTimes, faQuestion } from '@fortawesome/free-solid-svg-icons'
library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight, faCog, faPrint, faTimes, faQuestion);
import './styles/index.css'


class Cube extends Component {
    constructor(props) {
        super(props);

        this.store = configureStore();
        this.store.dispatch({type: "SET_INIT_PROPS",
            measures: props.measures,
            measures_list_top: props.measures_list_top,
            measures_list_left: props.measures_list_left,
        });
    }

    render() {
        return <Provider store={this.store}>
            <div className="cube">
                <CubeTopPanel/>
                <CubeTable/>
            </div>
        </Provider>
    }
}

Cube.defaultProps = {
    measures: [
        {
            name: "Measure 1 (Regions)",
            tree: {
                name: "All regions",
                code: "regions",
                hidden: false,
                childs: [
                    {
                        name: "Russia",
                        hidden: false,
                        childs: [
                            {
                                name: "Moscow",
                            },
                            {
                                name: "Lipetsk",
                            },
                            {
                                name: "Voronesh",
                            },
                        ]
                    },
                    {
                        name: "USA",
                        hidden: false,
                        childs: [
                            {
                                name: "California",
                            },
                            {
                                name: "Washington",
                            },
                        ]
                    },
                    {
                        name: "Georgia",
                        hidden: false,
                    }
                ]
            },
        },
        {
            name: "Measure 2 (Products)",
            tree: {
                name: "All products",
                code: "products",
                childs: [
                    {name: "Paper"},
                    {name: "Tables"},
                    {name: "Pencils"},
                ]
            }
        },
        {
            name: "Measure 3 (Years)",
            tree: {
                name: "All years",
                code: "years",
                childs: [
                    {name: "2018", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                    {name: "2017", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                    {name: "2016", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                ]
            }
        },
        {
            name: "Measure 4 (Scenarios)",

            tree: {
                name: "All scenarios",
                code: "scenarios",
                childs: [
                    {name: "Actual"},
                    {name: "Budget"},
                ]
            }
        },
    ],
    measures_list_top: ['regions', 'products'],
    measures_list_left: ['years', 'scenarios'],
};

Cube.propTypes = {
    measures: PropTypes.arrayOf(PropTypes.shape({

    }))
};

export default Cube;