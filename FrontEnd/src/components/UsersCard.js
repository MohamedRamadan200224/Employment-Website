import React from "react";
import Card from 'react-bootstrap/Card';
import "../css/JobsCard.css";
import { Link } from "react-router-dom";
const UsersCard=(props)=>{
    return(
        <div>
      <Card>
      <Card.Body>
        <Card.Title className="mr-3 ml-3 mu-3 mb-3 w-100"> <h4 className="mr-3 ml-3 mu-3 mb-3 w-100"  style={{backgroundColor: 'black',padding:'2px 2px',color:"white",borderRadius:"2px"}}>Name</h4> {props.name}</Card.Title>
        <Card.Text className="m-3">
         <h5 className="mr-3 ml-3 mu-3 mb-3 w-100" style={{backgroundColor: 'black',padding:'2px 2px',color:"white",borderRadius:"2px"}}>Email</h5> {props.email}
        </Card.Text>
        <Card.Text className="mr-3 ml-3 mu-3 mb-3">
        <h5 className="mr-3 ml-3 w-100 mu-3 mb-3"   style={{backgroundColor: 'black',padding:'2px 2px',color:"white",borderRadius:"2px"}}>Phone</h5> {props.phone}
        </Card.Text>
        <Link className="btn btn-dark w-100 mu-3 mb-1" to={"/"+ props.id}>Show User</Link>
      </Card.Body>
    </Card>
        </div>
    );
}
export default UsersCard;