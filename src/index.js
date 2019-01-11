import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {library} from '@fortawesome/fontawesome-svg-core'
import {faCaretDown, faCaretRight} from '@fortawesome/free-solid-svg-icons'

library.add(faCaretDown, faCaretRight);

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
        let $table = $('#frcTable'),
            $body = $table.find('.frc-table-body'),
            $top = $table.find('.frc-table-top table'),
            $left = $table.find('.frc-table-left table');

        $body.unbind('scroll');
        $body.scroll(() => {
            $left.css('margin-top', -$body.scrollTop());
            return $top.css('margin-left', -$body.scrollLeft());
        });
    }
    static get_init_state(props) {
        if(props.debug) {
            console.info('fs-react-cube - init', props);
        }
        //Проверка пропсов
        if (props.columns.length < 2) error('Measures length must be greater than 1');

        let columns = props.columns,
            columns_map = create_map(columns, 'code');

        const columns_top_codes = props.columns_top && props.columns_top.length > 0 ?
            props.columns_top : [columns[0].code],
            columns_left_codes = props.columns_left && props.columns_left.length > 0 ?
                props.columns_left : [columns[1].code];

        let init_trees_map = {},
            init_trees = columns.map((column, i) => {
                init_trees_map[column.code] = i;
                return SideTree.prepare_tree(column.tree)
            });
        if(props.debug) {
            console.log('init_trees', init_trees);
            console.log('init_trees_map', init_trees_map);
        }
        let columns_top = columns_top_codes.map(column_code => init_trees[init_trees_map[column_code]]),
            columns_top_names = columns_top_codes.map(code => columns[columns_map[code]].name),
            columns_left = columns_left_codes.map(column_code => init_trees[init_trees_map[column_code]]),
            columns_left_names = columns_left_codes.map(code => columns[columns_map[code]].name);

        return {
            columns_top: columns_top,
            columns_left: columns_left,
            columns_left_names: columns_left_names,
            columns_top_tree: new SideTree(columns_top),
            columns_left_tree: new SideTree(columns_left),
            props_hash: obj_hash(props),
        };
    }

    static getDerivedStateFromProps(props, state) {
        if(obj_hash(props) !== state.props_hash) {
            return Cube.get_init_state(props);
        }
        return null;
    }

    componentDidMount() { Cube.refix_table(); }
    componentDidUpdate() { Cube.refix_table(); }

    handleClickToggleTopChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => {
                //Если закрываем дерево - нужно скрыть так же детей детей, и детей их детей... :)
                if (new_hidden) {
                    child = SideTree.iterator_with_childs(child, child_tree => {
                        if (child_tree.code !== tree.code) {
                            child_tree.hidden = new_hidden;
                            child_tree.hidden_childs = new_hidden;
                        }
                        return child_tree;
                    });
                }
                return {
                    ...child,
                    hidden: new_hidden,
                }
            });

        let full_tree = this.state.columns_top_tree.set_element(tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({columns_top_tree: full_tree}, () => {
            if (!new_hidden) this.props.onOpen();
            else this.props.onClose();
            this.props.onChange(this.state.columns_left_tree, this.state.columns_top_tree);
        })
    }
    handleClickToggleLeftChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => {
                //Если закрываем дерево - нужно скрыть так же детей детей, и детей их детей... :)
                if (new_hidden) {
                    child = SideTree.iterator_with_childs(child, child_tree => {
                        if (child_tree.code !== tree.code) {
                            child_tree.hidden = new_hidden;
                            child_tree.hidden_childs = new_hidden;
                        }
                        return child_tree;
                    });
                }
                return {
                    ...child,
                    hidden: new_hidden,
                }
            });

        let full_tree = this.state.columns_left_tree.set_element(tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });

        this.setState({columns_left_tree: full_tree}, () => {
            if (!new_hidden) this.props.onOpen();
            else this.props.onClose();
            this.props.onChange(this.state.columns_left_tree, this.state.columns_top_tree);
        })
    }

    render() {
        let top_rows_count = this.state.columns_top.length,
            left_cols_count = this.state.columns_left.length;

        let trs_top = this.state.columns_top_tree.get_top_trs(),
            trs_left = this.state.columns_left_tree.get_left_trs();

        if(this.props.debug) {
            console.groupCollapsed('fs-react-cube render()');
            console.info('this.props', this.props);
            console.info('trs_top', trs_top);
            console.info('trs_left', trs_left);
            console.info('columns_top_tree', this.state.columns_top_tree);
            console.info('columns_left_tree', this.state.columns_left_tree);
            console.groupEnd();
        }

        let styling = {};

        styling.width = this.props.width;
        styling.gap_width = 5;
        styling.left_width = 110 * left_cols_count;
        styling.top_height = 30 * top_rows_count;
        styling.body_width = styling.width - styling.gap_width - styling.left_width - 1;
        styling.body_height = 310;

        return (
            <div className="frc">
                <div className="frc-table" id="frcTable" style={{width: this.props.width}}>
                    <header className="frc-table-top" style={{
                        marginLeft: `${styling.left_width + styling.gap_width}px`,
                        height: `${styling.top_height}px`,
                        width: `${styling.body_width}px`,
                    }}>
                        <table cellSpacing={0}>
                            <thead>
                            {trs_top.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th colSpan={td.colSpan} key={j}
                                                   onClick={this.handleClickToggleTopChilds.bind(this, td)}>
                                            {td.name}
                                            <span className="frc-caret">
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-right"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            </thead>
                        </table>
                    </header>
                    <aside className="frc-table-left" style={{width: `${styling.left_width}px`}}>
                        <div className="frc-table-left-heads" style={{
                            width: `${styling.left_width}px`,
                            height: `${styling.top_height + 1}px`,
                        }}>
                            {this.state.columns_left_names.map((name, i) => {
                                return <div key={i} className="frc-table-left-heads__head" style={{width: `${100 / this.state.columns_left_names.length}%`}}>
                                    {name}
                                </div>;
                            })}
                        </div>
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_left.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th rowSpan={td.rowSpan} key={j}
                                                   onClick={this.handleClickToggleLeftChilds.bind(this, td)}>
                                            {td.name}
                                            <span className={"frc-caret"}>
                                        {td.has_childs ? (!td.hidden_childs ?
                                            <FontAwesomeIcon icon={"caret-down"}/> :
                                            <FontAwesomeIcon icon={"caret-right"}/>) :
                                            false}
                                        </span>
                                        </th>
                                    })}
                                </tr>;
                            })}
                            <tr>
                                <td className="frc-no-border"></td>
                            </tr>
                            <tr>
                                <td className="frc-no-border"></td>
                            </tr>
                            </tbody>
                        </table>
                    </aside>
                    <div className="frc-table-body" style={{
                        width: `${styling.body_width}px`,
                        height: `${styling.body_height}px`,
                    }}>
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_left.map((left, i) => {
                                return <tr key={i}>
                                    {trs_top[trs_top.length - 1].tds.map((top, j) => {
                                        return <td key={j}>
                                            {this.props.data[i] && typeof this.props.data[i][j] !== 'undefined' ?
                                            this.props.data[i][j] : "-"}
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

Cube.defaultProps = {
    width: 700,
    debug: false,
    onChange: () => {
        // if (this.props.debug)
            console.info('fs-react-cube - onChange');
    },
    onOpen: () => {
        // if (this.props.debug)
            console.info('fs-react-cube - onOpen');
    },
    onClose: () => {
        // if (this.props.debug)
            console.info('fs-react-cube - onClose');
    },
};

Cube.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array),
    columns: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        tree: PropTypes.shape({
            name: PropTypes.string.isRequired,
            code: PropTypes.string,
            hidden: PropTypes.bool, //По умолчанию - true
            childs: PropTypes.array, //Такие же как и этот объект, рекурсивно (name, code, childs)
        }),
    })).isRequired,
    columns_top: PropTypes.arrayOf(PropTypes.string), //Codes of top columns
    columns_left: PropTypes.arrayOf(PropTypes.string), //Codes of left columns
    width: PropTypes.number,

    // getCell: PropTypes.func.isRequired, // Deprecated
    onChange: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,

    debug: PropTypes.bool,
};

export default Cube;