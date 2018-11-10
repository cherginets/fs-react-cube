import {error, create_map, copy} from './helper';

export default class SideTree {
    constructor(measures) {
        this.tree = this.init_tree(measures);
        this.tree = this.set_paths(this.tree);
    }

    init_tree(measures) {
        let result_tree = copy(measures[0]);
        let hidden_childs = true;
        if(typeof result_tree.hidden_childs !== 'undefined' && result_tree.hidden_childs === false) {
            hidden_childs = false;
        }
        result_tree.childs = result_tree.childs.map(child => ({...child, hidden: hidden_childs}));

        if (measures[1]) {
            result_tree = SideTree.iterator_with_childs(result_tree, (tree) => {
                return {
                    ...tree,
                    _subtree: this.init_tree(measures.slice(1, measures.length)),
                }
            });
        }

        return {
            ...result_tree,
        };
    }

    static iterator_with_childs(tree, callback) {
        tree = callback(tree);
        tree.childs = tree.childs.map((child, i) => SideTree.iterator_with_childs(child, callback));
        return tree;
    }

    set_paths(tree, path = [], path_cell = []) {
        tree.childs = tree.childs.map((child, i) => this.set_paths(child, path.concat(['childs', i]), path_cell.concat([tree.code])));
        if (tree._subtree) {
            tree._subtree = this.set_paths(tree._subtree, path.concat(['_subtree']), path_cell.concat([tree.code]));
        }
        return {
            ...tree,
            _path: path,
            _path_cell: path_cell.concat(tree.code),
        };
    }

    iterator(tree, callback = () => {}) {
        callback(tree);
        let result = [tree];
        tree.childs.forEach(child => result = result.concat(this.iterator(child, callback)));
        return result;
    }

    tree_get_deep_length(tree, filter = () => true) {
        let length = 0;

        SideTree.iterator_with_childs(tree, (child) => {
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
    //public section
    get_trs(tree = this.tree, param_length = 1) {
        let trs = [];
        if (tree.hidden) {
            return trs;
        }
        if (tree._subtree) {
            trs = this.get_trs(tree._subtree, param_length);
            trs = copy(trs);

            let length = this.tree_get_deep_length(tree._subtree, (tree) => !tree.hidden);
            length = length * param_length;
            trs[0].tds.unshift({...tree, rowSpan: length});
            tree.childs
                .filter((child) => !child.hidden)
                .forEach(child => {
                    trs = trs.concat(this.get_trs(child));
                });
        } else {
            trs.push({tds: [tree]});
            tree.childs.forEach(child => {
                this.iterator(child, (child) => {
                    if (!child.hidden) {
                        trs.push({tds: [child]});
                    }
                })
            })
        }
        return trs;
    };
    get_left_trs() {
        return this.get_trs()
    };
    get_top_trs() {
        let trs = this.get_trs();

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

    set_element(path, element) {
        let eval_str = `this.tree${path.map(key => `['${key}']`).join('')} = element`;
        element = copy(element);// Что бы не было варнинга

        eval(eval_str);
        return this;
    };

    static prepare_tree(tree, lvl = 0, path = [], root_code = tree.code) {
        tree._measure_path = path;
        if (tree.childs && tree.childs.length > 0) {
            tree.childs = tree.childs.map((child, i) => SideTree.prepare_tree(child, lvl + 1, path.concat(['childs', i]), root_code))
        } else {
            tree.childs = [];
        }
        tree.hidden = lvl !== 0;
        tree.hidden_childs = typeof tree.hidden_childs !== 'undefined' ? tree.hidden_childs : true;

        tree.lvl = lvl;
        tree.code = tree.code ? tree.code : tree.name.toLowerCase().replace(' ', '_').replace("\t", '_');
        tree.has_childs = tree.childs.length > 0;

        tree._root_code = root_code;

        return tree;
    };

    // Не используется но может пригодится
    /*
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
    */
}
