import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {library} from '@fortawesome/fontawesome-svg-core'
import {faCaretUp, faCaretDown, faCaretLeft, faCaretRight} from '@fortawesome/free-solid-svg-icons'

library.add(faCaretUp, faCaretDown, faCaretLeft, faCaretRight);

import './styles/index.css'
import $ from 'jquery';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {error, create_map, copy} from './helper';

window.$ = $;

class Cube extends Component {
    constructor(props) {
        super(props);

        //Проверка пропсов
        if (props.measures.length <= 2) error('Measures length must be greater than 1');

        let measures = props.measures,
            init_list_measures_top = props.measures_list_top && props.measures_list_top.length > 0 ?
                props.measures_list_top : [measures[0].tree.code],
            init_list_measures_left = props.measures_list_left && props.measures_list_left.length > 0 ?
                props.measures_list_left : [measures[1].tree.code];

        this.init_trees = measures.map(measure => this.prepareTree(measure.tree));
        this.init_trees_map = create_map(this.init_trees, 'code');

        this.state = {
            trees: this.init_trees,
            trees_map: this.init_trees_map,
            list_measures_top: init_list_measures_top,
            list_measures_left: init_list_measures_left,
        };

        this.state = {
            ...this.state,
            ...this.get_init_trees()
        }
    }

    get_init_trees() {
        let measures_top = this.state.list_measures_top.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_top_tree = this.fullTree_get(this.state.list_measures_top),

            measures_left = this.state.list_measures_left.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_left_tree = this.fullTree_get(this.state.list_measures_left);

        measures_top_tree = this.fullTree_setpaths(measures_top_tree);
        measures_left_tree = this.fullTree_setpaths(measures_left_tree);

        return {
            measures_left: measures_left,
            measures_left_tree: measures_left_tree,

            measures_top: measures_top,
            measures_top_tree: measures_top_tree,
        }
    };

    prepareTree(tree, lvl = 0, path = []) {
        tree._measure_path = path;
        if (tree.childs && tree.childs.length > 0) {
            tree.childs = tree.childs.map((child, i) => this.prepareTree(child, lvl + 1, path.concat(['childs', i])))
        } else {
            tree.childs = [];
        }
        tree.hidden = lvl !== 0;
        tree.hidden_childs = typeof tree.hidden_childs !== 'undefined' ? tree.hidden_childs : true;

        tree.lvl = lvl;
        tree.code = tree.code ? tree.code : tree.name;
        tree.has_childs = tree.childs.length > 0;

        return tree;
    };

    getTreeIterator(tree, callback = () => {
    }) {
        callback(tree);
        let result = [tree];
        tree.childs.forEach(child => result = result.concat(this.getTreeIterator(child, callback)));
        return result;
    }

    componentDidMount() {
        //region fixedTable jquery
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
        //endregion
    }

    getTrs(tree, param_length = 1) {
        let trs = [];
        if (tree.hidden) {
            return trs;
        }
        if (tree._subtree) {
            trs = this.getTrs(tree._subtree, param_length);
            trs = copy(trs);

            let length = this.tree_get_deep_length(tree._subtree, (tree) => !tree.hidden);
            length = length * param_length;
            trs[0].tds.unshift({...tree, rowSpan: length});
            tree.childs
                .filter((child) => !child.hidden)
                .forEach(child => {
                    trs = trs.concat(this.getTrs(child));
                });
        } else {
            trs.push({tds: [tree]});
            tree.childs.forEach(child => {
                this.getTreeIterator(child, (child) => {
                    if (!child.hidden) {
                        trs.push({tds: [child]});
                    }
                })
            })
        }
        return trs;
    };

    getTrsLeft() {
        return this.getTrs(this.state.measures_left_tree)
    };

    getTrsTop() {
        let trs = this.getTrs(this.state.measures_top_tree);

        let convert_trs_for_top = (trs) => {
            let result_trs = [], added_td;

            for (let i = trs.length - 1; i >= 0; i--) {
                // Костылииии. Максимум в шапке может быть 4 уровня (строк заголовков)
                if (trs[i].tds.length === 1) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});

                    result_trs[result_trs.length - 1].tds.unshift(trs[i].tds[0]);
                }
                else if (trs[i].tds.length === 2) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 2]) result_trs.unshift({tds: []});

                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
                else if (trs[i].tds.length === 3) {
                    if (!result_trs[result_trs.length - 1]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 2]) result_trs.unshift({tds: []});
                    if (!result_trs[result_trs.length - 3]) result_trs.unshift({tds: []});

                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 3];
                    result_trs[result_trs.length - 3].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
                else if (trs[i].tds.length === 4) {
                    if (!result_trs[result_trs.length - 4]) {
                        result_trs.unshift({tds: []});
                    }
                    added_td = trs[i].tds[trs[i].tds.length - 1];
                    result_trs[result_trs.length - 1].tds.unshift(added_td);

                    added_td = trs[i].tds[trs[i].tds.length - 2];
                    result_trs[result_trs.length - 2].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 3];
                    result_trs[result_trs.length - 3].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });

                    added_td = trs[i].tds[trs[i].tds.length - 4];
                    result_trs[result_trs.length - 4].tds.unshift({
                        ...added_td, colSpan: added_td.rowSpan
                    });
                }
            }

            return result_trs;
        };

        return convert_trs_for_top(trs);
    };


    handleClickToggleLeftChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.tree_set_element(this.state.measures_left_tree, tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({
            measures_left_tree: full_tree,
        })
    };

    handleClickToggleTopChilds(tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.tree_set_element(this.state.measures_top_tree, tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({
            measures_top_tree: full_tree,
        })
    };

    tree_iterator_with_childs(tree, callback) {
        tree = callback(tree);
        tree.childs = tree.childs.map((child, i) => this.tree_iterator_with_childs(child, callback));
        return tree;
    }

    tree_get_deep_length(tree, filter = () => true) {
        let length = 0;

        this.tree_iterator_with_childs(tree, (child) => {
            if (filter(child)) {
                if (child._subtree) {
                    length += this.tree_get_deep_length(child._subtree, filter);
                } else {
                    length++;
                }
            }
            return child;
        });

        return length;
    }

    tree_set_element(tree, path, element) {
        let eval_str = `tree${path.map(key => `['${key}']`).join('')} = element`;
        element = copy(element);// Что бы не было варнинга

        eval(eval_str);
        return tree;
    };

    fullTree_get(measures) {
        let result_tree = copy(this.init_trees[this.init_trees_map[measures[0]]]);

        if (measures[1]) {
            result_tree = this.tree_iterator_with_childs(result_tree, (tree) => {
                return {
                    ...tree,
                    _subtree: this.fullTree_get(measures.slice(1, measures.length)),
                }
            });
        }

        return {
            ...result_tree,
        };
    };

    fullTree_setpaths(tree, path = []) {
        tree.childs = tree.childs.map((child, i) => this.fullTree_setpaths(child, path.concat(['childs', i])));
        if (tree._subtree) {
            tree._subtree = this.fullTree_setpaths(tree._subtree, path.concat(['_subtree']))
        }
        return {
            ...tree,
            _path: path,
        };
    }

    // Не используется но может пригодится
    tree_get_length(tree, filter = () => true) {
        let length = 0;
        this.tree_iterator_with_childs(tree, (child) => {
            if (filter(child)) {
                length++;
            }
            return child;
        });
        return length;
    }

    render() {
        let top_rows_count = this.state.list_measures_top.length,
            left_cols_count = this.state.list_measures_left.length;

        let trs_top = this.getTrsTop(),
            trs_left = this.getTrsLeft();

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
};

export default Cube;