//BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    }

    Expense.prototype.calculatePercentages = function(totalIncome) {

        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
        this.percentage = -1;
    }

    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    var Income = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;

    }






    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type) {
        var sum = 0;


        data.allItems[type].forEach(function(cur) {

            sum += cur.value;

        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //CREATE NEW ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;



            //CREATE NEW ITEM BASED ON TYPE
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //PUSH ITEM INTO DATA
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {

            //TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            //BUDGET
            data.budget = data.totals.inc - data.totals.exp;
            //PERCENTAGE
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else data.percentage = -1
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentages(data.totals.inc);
            });
        },

        getPercentage: function () {
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: Number(data.totals.inc),
                totalExpenses: Number(data.totals.exp),
                percentage: data.percentage
            }
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {

                return current.id;


            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function() {
            console.log(data);
        }
    }
})();



//UI CONTROLLER

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };
    var formatNumber = function (num, type) {

        var num,numSplit,dec,type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = `${int.substr(0,int.length - 3)},${int.substr(int.length - 3, 3)}`;
        }
        dec = numSplit[1];

        return(`${type === 'exp' ? sign = '-' : sign = '+'} ${int}.${dec}`);
        // console.log(`${type}, ${int}${dec}`)

        // return (`${type}, ${aint}${dec}`)
    };
    var nodeListForEach = function (list,callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    //Some code

    return {

        getInput: function() {

            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: Number(document.querySelector(DOMstrings.inputValue).value)
            };

        },


        addListItem: function(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>
                </div>
            </div>


            </div>`
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },
        clearFields: function() {
            fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";


            });

            fieldsArr[0].focus();
        },

        displayBudget: function(object) {
            var type;
            object.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(object.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(object.totalIncome,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(object.totalExpenses,'exp');

            if (object.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = object.percentage + '%';
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }


        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            document.getElementById(selectorID).parentNode.removeChild(el)

        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function(current,index) {
                if(percentages[index] > 0)  {
                    current.textContent = percentages[index] + '%';

                } else {
                    current.textContent = percentages[index] + '---';

                }

            });
        },
        displayMonth : function () {

            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var months = ['January','Febrauary','March','April','May','June','July','August','September','October','November','December']

            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} of ${year}`;

        },
        changedType: function () {

            var fields = document.querySelectorAll(`${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return (DOMstrings);
        }

    };

})();


//GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl) {




    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(e) {

            if (e.keycode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var ctrlDeleteItem = function(e) {
        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log( e.target.parentNode.parentNode.parentNode.parentNode.id);


        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number(splitID[1]);

            //DELETE FROM DATA STRUCTURE
            budgetCtrl.deleteItem(type, ID);

            //DELETE FROM UI

            UICtrl.deleteListItem(itemID);
            //UPDATE AND SHOW NEW BUDGET
            updateBudget();

            updatePercentages();

        }
    }

    var updateBudget = function() {
        budgetCtrl.calculateBudget();

        //RETURN BUDGET
        var budget = budgetCtrl.getBudget();

        console.log(budget);
        // DISPLAY BUDGET ON UI
        UICtrl.displayBudget(budget);

    }


    //do not repeat yourself (dry)
    var ctrlAddItem = function() {


        //GET INPUT DATA
        var input = UICtrl.getInput();
        console.log(input);

        //ADD ITEM TO BUDGET controller
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            var newItem = budgetController.addItem(input.type, input.description, input.value)
            //ADD ITEM TO USER INTERFACE
            UICtrl.addListItem(newItem, input.type);


            //CLEAR fields
            UICtrl.clearFields();
            //CALCULATE BUDGET

            updateBudget();
            updatePercentages();

            //DISPLAY BUDGET

        }

    }
    var updatePercentages = function() {

        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentage();

        UICtrl.displayPercentages(percentages);


    };
    return {
        init: function() {
            console.log("application started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1


            })
            setupEventListeners();
        }
    }


})(budgetController, UIController);


controller.init();
