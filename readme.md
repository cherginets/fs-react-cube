# fs-react-cube
React компонент реализующий Cube (таблицу с раскрывающимися заголовками, ячейки которой несут в себе агрегированные значения из БД)

## How install
```
npm install fs-react-cube --save
```

## PropTypes

### measures
Обязательное.\
\
Массив с объектами, описывающими измерения, по которым строятся заголовки таблицы. Их не должно быть меньше 2.\
Объект измерения должен иметь следующую минимальную необходимую структуру:\
```
{
    code: 'regions', //Код измерения (указывается в measures_list_left, measures_list_top)
    tree: {//Дерево заголовков измерения
        name: 'All regions', //Имя заголовка. Отображения на странице.
        code: 'all_regions', //Код заголовка. Передается в getCell значением пути заголовка. Если не задать - сформируется автоматически из имени переводом в lower case и заменой пробелов на _
        childs: [...] // Такие же tree's. Вложенных childs, и их childs, и их... может быть сколько угодно.
    } 
}
```
Пример:
```
[
            {
                name: "Measure 1 (Regions)",
                code: 'regions',
                tree: {
                    name: "All regions",
                    childs: [
                        {
                            name: "Russia",
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
                        }
                    ]
                },
            },
            {
                name: "Measure 2 (Products)",
                code: 'products',
                tree: {
                    name: "All products",
                    code: "all_products",
                    childs: [
                        {name: "Paper"},
                        {name: "Tables"},
                        {name: "Pencils"},
                    ]
                }
            },
            {
                name: "Measure 3 (Years)",
                code: 'years',
                tree: {
                    name: "All years",
                    code: "all_years",
                    hidden_childs: false,
                    childs: [
                        {name: "2018", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2017", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                        {name: "2016", childs: [{name: "Q 1"}, {name: "Q 2"}, {name: "Q 3"}, {name: "Q 4"}]},
                    ]
                }
            },
            {
                name: "Measure 4 (Scenarios)",
                code: 'scenarios',
                tree: {
                    name: "All scenarios",
                    code: "all_scenarios",
                    hidden_childs: false,
                    childs: [
                        {name: "Actual"},
                        {name: "Budget"},
                    ]
                }
            },
        ]
```

### measures_list_left
Array. По умолчанию [measures[0].code]\
\
Массив с кодами измерений. Определяет набор столбцов для левого блока с заголовками.
Например:
```
['regions', 'products']
```

### measures_list_top
Array. По умолчанию [measures[1].code]\
\
Массив с кодами измерений. пределяет набор строк для верхнего блока с заголовками.
Например:
```
['years', 'scenarios']
```
### width
Integer. По умолчанию - 700.\
\
Фиксированная ширина таблицы в пикселях.

### getCell
Обязательное. Function.\
\
Вызывается при каждом рендере таблицы **для каждой** ячейки. Функция принимает два аргумента.
* **path_left** - адрес ячейки по левому дереву заголовков. Пример:
```
["all_scenarios", "budget"]
```
* **path_top** - адрес ячейки по верхнему дереву заголовков. Пример:
```
["all_regions", "all_products", "all_years", "2018"]
```
Функция должна возвращать значение ячейки для отображения в любом формате.

### onChange
Function.\
\
Вызывается при открытии\закрытии заголовка.

### onOpen
Function.\
\
Вызывается при открытии заголовка.

### onClose
Function.\
\
Вызывается при закрытии заголовка.

### debug
Bool. По умолчанию - false.\
\
Выводить ли служебные логи в консоль.



    width: PropTypes.number,

    getCell: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,

    debug: PropTypes.bool,