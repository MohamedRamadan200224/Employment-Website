const mysql= require("mysql");
const connecion= mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "",
    database: "iaproject", 
    port: "3306"}

);

connecion.connect((err)=>{
    if (err) {
        console.log(err);
    } else {
       console.log("connection to db established"); 
    }
});
    module.exports= connecion;