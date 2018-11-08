export const error = (text) => {
    let mes = 'fs-react-cube - ' + text;
    console.error();
    throw Error(mes);
};

export const create_map = (array, key) => {
    let result = {};
    array.forEach((item, i) => result[item[key]] = i);
    return result;
};

export const copy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const get_range = (end, start = 1) => {
    let result = [];
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result;
};

export const obj_hash = (obj) => {
    return JSON.stringify(obj);
};




