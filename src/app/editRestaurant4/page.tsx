'use client'                     // NEED THIS to be able to embed HTML in TSX file
import { Restaurant, Table } from '../../model'
import React, { useEffect, useState } from 'react'
// import { Restaurant } from '../../model'

//import { Link } from 'react-router-dom'
import axios from "axios";
import { Result } from 'postcss';

import {sessionData, setSessionData} from '../sharedData';

//import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import dynamic from "next/dynamic";
// const BootstrapScript = dynamic(() => import('bootstrap/dist/js/bootstrap.bundle.min.js'), {
//   ssr: false,
// });


// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {
    'Access-Control-Allow-Origin' :  '*'
  }
});
function TableList(props: { tables: Table[] | undefined, deleteTable: (restaurant_ID: number) => void, editTable: (table_ID: number) => void }) {
  // if "not yet set" then simply show "Loading..."
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Safe to use document here
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
    }
  }, []);
  console.log("tablelist", props.tables)
  if (!props.tables) return <div>There are currently no tables in the system.</div>;
  // For each constant in 'props.constants', generate a <li> ... </li> block containing name and value
  return (
    <div className="accordion accordion-flush" id="accordionExample">
      <div className="accordion-item">
        {props.tables.map(tables => (
          <li className="list-group-item" key={tables.table_ID}>

            <h2 className="accordion-header">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={'#collapse' + tables.table_ID}
                aria-expanded="true" aria-controls={'collapse' + tables.table_ID}>
                Table Number: {tables.table_num}
              </button>
            </h2>
            <div id={'collapse' + tables.table_ID} className="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <p><strong>Table ID:</strong> {tables.table_ID}</p>

                <div className="row justify-content-center align-items-center mb-3">
                  <div className="col-auto">
                    <label className="col-form-label">Table num.</label>
                  </div>
                  <div className="col-2">
                    <input className="form-control" id={"table_num_" + tables.table_ID} defaultValue={tables.table_num} />
                  </div>
                  <div className="col-auto">
                    <label className="col-form-label">Seats</label>
                  </div>
                  <div className="col-2">
                    <input className="form-control" id={"num_seats_" + tables.table_ID} defaultValue={tables.num_seats}/>
                  </div>
                </div>

                
                <div className='row'>
                  <div className='col-auto'>
                    {/* <button className="btn btn-secondary me-2" onClick={() => props.deleteTable(tables.table_num)}>Save changes</button> */}
                    <button className="btn btn-secondary me-2" onClick={() => props.editTable(tables.table_ID)}>Save changes</button>
                    <button className="btn btn-danger" onClick={() => props.deleteTable(tables.table_num)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
        )
        }
      </div>
    </div>
  )
}

let dataVar: sessionData

// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [tables, setTables] = React.useState<Table[] | undefined>(undefined); // state from the AWS API
  const [errorMsgString_editTable, setErrMsgString_editTable] = React.useState('')
  const [successMsgString_editTable, setSuccessMsgString_editTable] = React.useState('')
  const [errorMsgString_editRestaurant, setErrMsgString_editRestaurant] = React.useState('')
  const [successMsgString_editRestaurant, setSuccessMsgString_editRestaurant] = React.useState('')
  const [errorMsgString_createTable, setErrMsgString_createTable] = React.useState('')
  const [successMsgString_createTable, setSuccessMsgString_createTable] = React.useState('')
  const [errorMsgString_editSchedule, setErrMsgString_editSchedule] = React.useState('')
  const [successMsgString_editSchedule, setSuccessMsgString_editSchedule] = React.useState('')
  

  const [data, setData] = useState<sessionData>({pin: '', restaurant_ID : '', name : '', address : '', description : '', start_time : '', end_time : '', closed_days : '', active : false, table_ID : ''}); 

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      let data = sessionStorage.getItem('sessionData');
      if (data) {
        setData(JSON.parse(data));
      }
    }
  }, []); // Runs only once on component mount

  const reactToSessionData = (newData: sessionData) => {
    setSessionData(newData);
  }
  
  function updateReactData (newData: Partial<sessionData>){
    let dataVar = structuredClone(data);
    if (newData.pin) {
      dataVar.pin = newData.pin;
    }
    if (newData.restaurant_ID) {
      dataVar.restaurant_ID = newData.restaurant_ID;
    }
    if (newData.name) {
      dataVar.name = newData.name;
    }
    if (newData.address) {
      dataVar.address = newData.address;
    }
    if (newData.description) {
      dataVar.description = newData.description;
    }
    if (newData.start_time) {
      dataVar.start_time = newData.start_time;
    }
    if (newData.end_time) {
      dataVar.end_time = newData.end_time;
    }
    if (newData.closed_days) {
      dataVar.closed_days = newData.closed_days;
    }
    if (newData.active) {
      dataVar.active = newData.active;
    }
    if (newData.table_ID) {
      dataVar.table_ID = newData.table_ID;
    }
    setData(dataVar);
    reactToSessionData(dataVar);
  }


  // utility method (that can be passed around) for refreshing display in React
  const andRefreshDisplay = () => {
      forceRedraw(redraw+1)
  }
  function editRestaurant() {
    dataVar = structuredClone(data)

    let name = data.name
    let address = document.getElementById("addressBox") as HTMLInputElement
    data.address = address.value
    let description = document.getElementById("descriptionBox") as HTMLInputElement
    data.description = description.value
    let start_time = data.start_time
    let end_time = data.end_time
    let closed_days = data.closed_days
    let active = data.active
    resetMessages()
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/manager/editRestaurant', {'name': name, 'address':address.value, 'description':description.value, 'start_time':start_time, 'end_time':end_time, 'closed_days':closed_days, 'active':active})
      .then(function (response) {
        let status = response.data.statusCode
        let result = document.getElementById("result") as HTMLInputElement
        if (status == 200) {
          setSuccessMsgString_editRestaurant("Restaurant address/description successfully edited")
          updateReactData({address: address.value, description: description.value})
        } else {
          setErrMsgString_editRestaurant("Error: " + response.data.error)
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
        andRefreshDisplay()
      })
      .catch(function (error) {
        console.log(error)
        setErrMsgString_editRestaurant("Failed to edit restaurant. Please try again.")
        andRefreshDisplay()
      })
  }
  function editSchedule(restaurant_ID: number) {
    
    let start_time = document.getElementById("start_time") as HTMLInputElement
    data.start_time = start_time.value
    //'T12:00:00'
    console.log(start_time.value)
    let end_time = document.getElementById("end_time") as HTMLInputElement
    data.end_time = end_time.value
    console.log(end_time.value)
    resetMessages()
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/manager/editSchedule', {'restaurant_ID': restaurant_ID, 'start_time':start_time.value, 'end_time':end_time.value})
      .then(function (response) {
        let status = response.data.statusCode
        let result = document.getElementById("result") as HTMLInputElement
        if (status == 200) {
          setSuccessMsgString_editSchedule("Restaurant Schedule successfully edited")
          updateReactData({start_time: start_time.value, end_time: end_time.value})
        } else {
          setErrMsgString_editSchedule("Error: " + response.data.error)
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
        andRefreshDisplay()
      })
      .catch(function (error) {
        console.log(error)
        setErrMsgString_editSchedule("Failed to edit schedule. Please try again.")
        andRefreshDisplay()
      })
  }
  function createTable(restaurant_ID:number) {
    // potentially modify the model
    let confirmation_ID = null
    let table_num = document.getElementById("table_num") as HTMLInputElement
    let seats = document.getElementById("seats") as HTMLInputElement
    resetMessages()
    if (table_num && seats) {
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/manager/createTable', {"num_seats":seats.value, "restaurant_ID":restaurant_ID, "confirmation_ID": confirmation_ID, "table_num": table_num.value})
      .then(function (response) {
        // not sure what to do ON failure?
        table_num.value = ''
        seats.value = ''
        // force reload of constants. Do so by clearing out constants and refreshing display
        setSuccessMsgString_createTable("Table successfully created!")
        setTables(undefined)
        andRefreshDisplay()
      })
      .catch(function (error) {
        setErrMsgString_createTable("Failed to create table. Please try again.")
        console.log(error)
        andRefreshDisplay()
      })
    }
  }
  function retrieveTables(restaurant_ID:number)  {
      console.log("Retrieving tables for restaurant ID:", restaurant_ID);
    instance.post('/manager/listTables',{'restaurant_ID':restaurant_ID})
      .then(function (response) {
        console.log("API Response:", response.data);
        console.log("Tables retrieved successfully:", response.data.result);
        let status = response.data.statusCode
        if (status == 200) {
          console.log("IM HERE:", response.data.result)
          let tables:Array<Table> = []
          for (let tab of response.data.result) {
            tables.push(new Table(tab.table_num, tab.seats, tab.table_ID, restaurant_ID))
            console.log("ACTIVE:", tab.table_num)
          }
          setTables(response.data.result)
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  React.useEffect(() => {
    //console.log("Updated tables in state:", tables);
    andRefreshDisplay()
  }, [tables]);
  React.useEffect( () => {
    if (!tables) {
      retrieveTables(Number(data.restaurant_ID))
      //console.log("restaurants hello:", tables)
    }
  }, [redraw])
  function deleteTable(table_num:number) {
    // Access the REST-based API and in response (on a 200 or 400) process.
    instance.post('/manager/deleteTable',
       {"table_num":table_num})
    .then(function (response) {
      // not sure what to do ON failure?
      // force reload of constants. Do so by clearing out constants and refreshing display
      setTables(undefined)
      andRefreshDisplay()
    })
    .catch(function (error) {
      console.log(error)
    })
  }
  // helper method that only needs 'name' to operate
  function removeTable(table_num:number) {
    deleteTable(table_num)
  }

  function editTable(arg_table_ID: number) {
    let table_ID = arg_table_ID
    let table_num1 = document.getElementById("table_num_" + table_ID) as HTMLInputElement
    let confirmation_ID = null
    let restaurant_ID1 = data.restaurant_ID
    //'T12:00:00'
    let num_seats = document.getElementById("num_seats_" + table_ID) as HTMLInputElement
    console.log(table_num1.value + "good day")
    console.log(table_num1.value)
    console.log(table_num1.value)
    console.log(table_num1.value)
    console.log(table_ID)
    resetMessages()
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/manager/editTable', {'table_ID': table_ID, 'num_seats':num_seats.value, "restaurant_ID":restaurant_ID1, "confirmation_ID": confirmation_ID,'table_num':table_num1.value })
      .then(function (response) {
        let status = response.data.statusCode

        let result = document.getElementById("result") as HTMLInputElement
        if (status == 200) {
          setSuccessMsgString_editTable("Restaurant table (ID: " + arg_table_ID+ ") successfully edited")
        } else {
          setErrMsgString_editTable("Error: " + response.data.error)
        }
        setTables(undefined)
        andRefreshDisplay()
      })
      .catch(function (error) {
        console.log(error)
        setErrMsgString_editTable("Failed to edit restaurant. Please make sure it's not active")
        andRefreshDisplay()
      })
  }
  
  function showError(errorMsg:string) {
    if (errorMsg !== '') {
      console.log("Error:", errorMsg)
      return <div className="alert alert-danger" role="alert">{errorMsg}</div>
    }
    else {
      return null
    }
  }
  function showSuccess(successMsg:string) {
    if (successMsg !== '') {
      console.log("Success:", successMsg)
      return <div className="alert alert-success" role="alert">{successMsg}</div>
    }
    else {
      return null
    }
  }
  function showError_editTable(errorMsg:string) {
    if (errorMsg !== '') {
      console.log("Error:", errorMsg)
      return <div className="alert alert-danger" role="alert">{errorMsgString_editTable}</div>
    }
    else {
      return null
    }
  }
  function showSuccess_editTable(successMsg:string) {
    if (successMsg !== '') {
      console.log("Success:", successMsg)
      return <div className="alert alert-success" role="alert">{successMsgString_editTable}</div>
    }
    else {
      return null
    }
  }
  function resetMessages() {
    setErrMsgString_editTable('')
    setSuccessMsgString_editTable('')
    setErrMsgString_editRestaurant('')
    setSuccessMsgString_editRestaurant('')
    setErrMsgString_createTable('')
    setSuccessMsgString_createTable('')
    setErrMsgString_editSchedule('')
    setSuccessMsgString_editSchedule('')
  }
  return (
    <main className="flex flex-col items-center justify-between p-4">
      
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/restaurantManagerHome">My Restaurant</a></li>
          <li className="breadcrumb-item active" aria-current="page">Edit Restaurant</li>
        </ol>
      </nav>

      <div className="container text-center mb-4">
        <h1>Edit a Restaurant</h1>
      </div>
      <div className="container col-3 col-md-4 mb-4">
        {showError(errorMsgString_editRestaurant)}
        {showSuccess(successMsgString_editRestaurant)}
        <label className="form-label">Address</label>
        <input className="form-control" type="text" id="addressBox" defaultValue={data.address}></input>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" id="descriptionBox" rows={5} defaultValue={data.description}></textarea>
        </div>
        <button className="btn btn-primary" type="button" onClick={(e) => editRestaurant()}>Edit</button>
      </div>

      <div className="container text-center mb-4">
        <h1>Edit Schedule</h1>
      </div>
      <div className="container col-3 col-md-4 mb-5">
        {showError(errorMsgString_editSchedule)}
        {showSuccess(successMsgString_editSchedule)}
        <div className='mb-1'>
          <label className="form-label">Start Time</label>
          <input type='time' className="form-control" id="start_time" defaultValue={data.start_time}/>
        </div>
        <div className='mb-3'>
          <label className="form-label">End Time</label>
          <input type='time' className="form-control" id="end_time" defaultValue={data.end_time} />
        </div>

        <button className="btn btn-primary" onClick={(e) => editSchedule(Number(data.restaurant_ID))}>Edit Schedule</button>
      </div>

      <div className="container text-center mb-4">
        <h1>Create Table</h1>
      </div>
      <div className="container col-3 col-md-4 mb-5">
        {showError(errorMsgString_createTable)}
        {showSuccess(successMsgString_createTable)}
        <div className='mb-1'>
          <label className="form-label">Table Number</label>
          <input className="form-control" id="table_num" />
        </div>
        <div className='mb-3'>
          <label className="form-label">Table Seats</label>
          <input className="form-control" id="seats" />
        </div>

        <button className="btn btn-primary" onClick={(e) => createTable(Number(data.restaurant_ID))}>Create Table</button>
      </div>

      <div className="container text-center mb-4">
        <h1>Tables</h1>
      </div>

      <div className="container col-4 col-md-4 mb-4">
        {showError_editTable(errorMsgString_editTable)}
        {showSuccess_editTable(successMsgString_editTable)}
        <TableList tables={tables} deleteTable={removeTable} editTable={editTable} />
      </div>
    </main>
  )
}
//next-link