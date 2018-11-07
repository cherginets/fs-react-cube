import React, {Component} from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux'

window.$ = $;

let get_range = (end, start = 1) => {
    let result = [];
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result;
};
let create_map = (array, key) => {
    let result = {};
    array.forEach((item, i) => result[item[key]] = i)
    return result;
};
let copy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

class CubeTable extends Component {
    constructor(props) {
        super(props);

        let measures = props.measures,
            init_list_measures_head = props.measures_list_top,
            init_list_measures_left = props.measures_list_left;

        this.init_trees = measures.map(measure => this.prepareTree(measure.tree));
        this.init_trees_map = create_map(this.init_trees, 'code');

        this.state = {
            trees: this.init_trees,
            trees_map: this.init_trees_map,
            list_measures_head: init_list_measures_head,
            list_measures_left: init_list_measures_left,
        };

        this.state = {
            ...this.state,
            ...this.get_init_trees()
        }
    }

    get_init_trees() {
        let measures_head = this.state.list_measures_head.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_head_tree = this.fullTree_get(this.state.list_measures_head),

            measures_left = this.state.list_measures_left.map(measure_code => copy(this.init_trees[this.init_trees_map[measure_code]])),
            measures_left_tree = this.fullTree_get(this.state.list_measures_left);

        measures_head_tree = this.fullTree_setpaths(measures_head_tree);
        measures_left_tree = this.fullTree_setpaths(measures_left_tree);

        return {
            measures_left: measures_left,
            measures_left_tree: measures_left_tree,

            measures_head: measures_head,
            measures_head_tree: measures_head_tree,
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

    getTreeIterator(tree, callback = () => {}) {
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
            $topside = $(el).find('.cube-table-header table');
            return $($body).scroll(function () {
                $($leftside).css('margin-top', -$($body).scrollTop());
                return $($topside).css('margin-left', -$($body).scrollLeft());
            });
        };
        new fixedTable($('#cubeTable'));
        //endregion
    }

    getTrs (tree, param_length = 1) {
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
    getTrsLeft () {
        return this.getTrs(this.state.measures_left_tree)
    };
    getTrsHead () {
        let trs = this.getTrs(this.state.measures_head_tree);

        let convert_trs_for_head = (trs) => {
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

        return convert_trs_for_head(trs);
    };

    render() {
        let top_rows_count = this.state.list_measures_head.length,
            left_cols_count = this.state.list_measures_left.length;

        let trs_head = this.getTrsHead(),
            trs_left = this.getTrsLeft();

        console.groupCollapsed('render()');
        console.info('this.props', this.props);
        console.info('trs_head', trs_head);
        console.info('trs_left', trs_left);
        console.info('measures_head_tree', this.state.measures_head_tree);
        console.info('measures_left_tree', this.state.measures_left_tree);
        console.groupEnd();

        return (
            <div>
                <div className="cube-table" id="cubeTable">
                    <header className="cube-table-header" style={{
                        marginLeft: (110 * left_cols_count + 1) + "px",
                        height: (30 * top_rows_count + 1) + "px",
                    }}>
                        <table cellSpacing={0}>
                            <thead>
                            {trs_head.map((tr, i) => {
                                return <tr key={i}>
                                    {tr.tds.map((td, j) => {
                                        return <th colSpan={td.colSpan} key={j}
                                                   onClick={this.handleClickToggleHeadChilds.bind(this, td)}>
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
                            <tr><td className="cube-no-border"></td>
                            </tr>
                            <tr><td className="cube-no-border"></td>
                            </tr>
                            </tbody>
                        </table>
                    </aside>
                    <div className="cube-table-body">
                        <table cellSpacing={0}>
                            <tbody>
                            {trs_left.map((left, i) => {
                                return <tr key={i}>
                                    {trs_head[trs_head.length - 1].tds.map((head, j) => {
                                        return <td key={j}>
                                            cell{i}-{j}
                                        </td>
                                    })}
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{clear: 'both'}} />
                </div>
            </div>
        );
    }

    handleClickToggleLeftChilds (tree) {
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
    handleClickToggleHeadChilds (tree) {
        let new_hidden = !tree.hidden_childs,
            new_childs = tree.childs.map(child => ({...child, hidden: new_hidden}));

        let full_tree = this.tree_set_element(this.state.measures_head_tree, tree._path, {
            ...tree,
            childs: new_childs,
            hidden_childs: new_hidden,
        });
        this.setState({
            measures_head_tree: full_tree,
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
            if(filter(child)) {
                if(child._subtree) {
                    length += this.tree_get_deep_length(child._subtree, filter);
                } else {
                    length++;
                }
            }
            return child;
        });

        return length;
    }
    tree_set_element (tree, path, element) {
        let eval_str = `tree${path.map(key => `['${key}']`).join('')} = element`;
        element = copy(element);// Что бы не было варнинга

        eval(eval_str);
        return tree;
    };

    fullTree_get (measures) {
        let result_tree = copy(this.init_trees[this.init_trees_map[measures[0]]]);

        if(measures[1]) {
            result_tree = this.tree_iterator_with_childs(result_tree, (tree) => {
                return {
                    ...tree,
                    _subtree: this.fullTree_get(measures.slice(1,measures.length)),
                }
            });
        }

        return {
            ...result_tree,
        };
    };
    fullTree_setpaths(tree, path = []) {
        tree.childs = tree.childs.map((child, i) => this.fullTree_setpaths(child, path.concat(['childs', i])));
        if(tree._subtree) {
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
            if(filter(child)) {
                length++;
            }
            return child;
        });
        return length;
    }
}

CubeTable.defaultProps = {

};

CubeTable.propTypes = {

};

const mapStateToProps = (state, ownProps) => ({
    measures: state.table.measures,
    measures_list_top: state.table.measures_list_top,
    measures_list_left: state.table.measures_list_left,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    // settings_close_modal: settings_close_modal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CubeTable);
