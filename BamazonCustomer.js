//require npm package mysql and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');
//create connection to data base
var connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 8889,
  user: "root",
  password: "root",
  database: "Bamazon"
})

function start(){
//prints products and their details
connection.query('SELECT * FROM Products', function(err, res){
  if(err) throw err;

  console.log('------THANK YOU FOR SHOPPING AT BAMAZON!------')
  console.log('----------------------------------------------------------------------------------------------------')

  for(var i = 0; i<res.length;i++){
    console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
    console.log('--------------------------------------------------------------------------------------------------')
  }

  console.log(' ');
  inquirer.prompt([
    {
      type: "input",
      name: "id",
      message: "Please chose an ID of the product you would like to purchase?",
      validate: function(value){
        if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
          return true;
        } else{
          return false;
        }
      }
    },
    {
      type: "input",
      name: "qty",
      message: "How many would you like to purchase?",
      validate: function(value){
        if(isNaN(value)){
          return false;
        } else{
          return true;
        }
      }
    }
    ]).then(function(ans){
      var whatToBuy = (ans.id)-1;
      var howMuchToBuy = parseInt(ans.qty);
      var grandTotal = parseFloat(((res[whatToBuy].Price)*howMuchToBuy).toFixed(2));

      //check inventory of products
      if(res[whatToBuy].StockQuantity >= howMuchToBuy){
        //updates quantity of products
        connection.query("UPDATE Products SET ? WHERE ?", [
        {StockQuantity: (res[whatToBuy].StockQuantity - howMuchToBuy)},
        {ItemID: ans.id}
        ], function(err, result){
            if(err) throw err;
            console.log("Thank You! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you!.");
        });

        connection.query("SELECT * FROM Departments", function(err, deptRes){
          if(err) throw err;
          var index;
          for(var i = 0; i < deptRes.length; i++){
            if(deptRes[i].DepartmentName === res[whatToBuy].DepartmentName){
              index = i;
            }
          }
          
          //updates sales in table
          connection.query("UPDATE Departments SET ? WHERE ?", [
          {TotalSales: deptRes[index].TotalSales + grandTotal},
          {DepartmentName: res[whatToBuy].DepartmentName}
          ], function(err, deptRes){
              if(err) throw err;
          });
        });

      } else{
        console.log("Sorry, We do not have enough in stock!");
      }

      reprompt();
    })
})
}

//asks if they would like to continue shopping
function reprompt(){
  inquirer.prompt([{
    type: "confirm",
    name: "reply",
    message: "Would you like to continue shopping?"
  }]).then(function(ans){
    if(ans.reply){
      start();
    } else{
      console.log("Please come back soon!");
    }
  });
}

start();