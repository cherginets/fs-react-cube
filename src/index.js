import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {library} from '@fortawesome/fontawesome-svg-core'
import {faCaretUp, faCaretDown, faCaretLeft, faCaretRight} from '@fortawesome/free-solid-svg-icons'

library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight);

import './styles/index.css'
import $ from 'jquery';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {error, create_map, copy, obj_hash} from './helper';
import SideTree from './SideTree';

window.$ = $;

class Cube extends Component {
    constructor(props) {
        super(props);

        this.state = {
            props_hash: null,
        };
    }
    static refix_table() {
        let fixedTable;
        fixedTable = function (el) {
            let $body, $topside, $leftside;
            $body = $(el).find('.cube-table-body');
            $leftside = $(el).find('.cube-table-left table');
            $topside = $(el).find('.cube-table-top table');
            return $($body).scroll(function () {
                $($leftside).css('margin-top', -$($body).scrollTop());
                return $($topside).css('margin-left', -$($body).scrollLeft());
            });
        };
        new fixedTable($('#cubeTable'));
    }
    static get_init_state(props) {
        console.info('fs-react-cube - init', props);
        //Проверка пропсов
        if (props.measures.length <= 2) error('Measures length must be greater than 1');

        let measures = props.measures;

        const measures_top_codes = props.measures_list_top && props.measures_list_top.length > 0 ?
            props.measures_list_top : [measures[0].tree.code],
            measures_left_codes = props.measures_list_left && props.measures_list_left.length > 0 ?
                props.measures_list_left : [measures[1].tree.code];

        let init_trees = measures.map(measure => SideTree.prepare_tree(measure.tree));
        let init_trees_map = create_map(init_trees, 'code');

        let measures_top = measures_top_codes.map(measure_code => init_trees[init_trees_map[measure_code]]),
            measures_left = measures_left_codes.map(measure_code => init_trees[init_trees_map[measure_code]]);

        Cube.refix_table();
        return {
            measures_top: measures_top,
            measures_left: measures_left,
            measures_top_tree: new SideTree(measures_top),
            measures_left_tree: new SideTree(measures_left),
            props_hash: obj_hash(props),
        };
    }

    static getDerivedStateFromProps(props, state) {
        if(obj_hash(props) !== state.props_hash) {
            return Cube.get_init_state(props);
        }
        return null;
    }

    componentDidMount() {

    }

    handleClickToggleLeftChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.state.measures_left_tree.set_element(tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });

        this.setState({ measures_left_tree: full_tree })
    };
    handleClickToggleTopChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.state.measures_top_tree.set_element(tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({ measures_top_tree: full_tree })
    };

    render() {
        let top_rows_count = this.state.measures_top.length,
            left_cols_count = this.state.measures_left.length;

        let trs_top = this.state.measures_top_tree.get_top_trs(),
            trs_left = this.state.measures_left_tree.get_left_trs();

        console.groupCollapsed('fs-react-cube render()');
        console.info('this.props', this.props);
        console.info('trs_top', trs_top);
        console.info('trs_left', trs_left);
        console.info('measures_top_tree', this.state.measures_top_tree);
        console.info('measures_left_tree', this.state.measures_left_tree);
        console.groupEnd();

        return (
            <div className="cube">
                <div className="cube-table" id="cubeTable">
                    <header className="cube-table-top" style={{
                        marginLeft: (110 * left_cols_count + 1) + "px",
                        height: (30 * top_rows_count + 1) + "px",
                    }}>
                        <table cellSpacing={0}>
                            <thead>
                            {trs_top.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th colSpan={td.colSpan} key={j}
                                                   onClick={this.handleClickToggleTopChilds.bind(this, td)}>
                                            {td.name}
                                            <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-right"}/> :
                                            <FontAwesomeIcon icon={"caret-left"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            </thead>
                        </table>
                    </header>
                    <aside className="cube-table-left" style={{width: (110 * left_cols_count + 1) + 'px'}}>
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_left.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th rowSpan={td.rowSpan} key={j}
                                                   onClick={this.handleClickToggleLeftChilds.bind(this, td)}>
                                            {td.name}
                                            <span style={{marginLeft: "7px"}}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-up"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            <tr>
                                <td className="cube-no-border"></td>
                            </tr>
                            <tr>
                                <td className="cube-no-border"></td>
                            </tr>
                            </tbody>
                        </table>
                    </aside>
                    <div className="cube-table-body">
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_left.map((left, i) => {
                                return <tr key={i}>
                                    {trs_top[trs_top.length - 1].tds.map((head, j) => {
                                        return <td key={j}>
                                            cell{i}-{j}
                                        </td>
                                    })}
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>
            </div>
        );
    }
}

Cube.defaultProps = {};

Cube.propTypes = {
    measures: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        tree: PropTypes.shape({
            name: PropTypes.string.isRequired,
            code: PropTypes.string,
            hidden: PropTypes.bool, //По умолчанию - true
            childs: PropTypes.array, //Такие же как и этот объект, рекурсивно (name, code, childs)
        }),
    })).isRequired,
    measures_list_top: PropTypes.arrayOf(PropTypes.string), //Codes of top measures
    measures_list_left: PropTypes.arrayOf(PropTypes.string), //Codes of left measures
    reload: PropTypes.func,
};

export default Cube;