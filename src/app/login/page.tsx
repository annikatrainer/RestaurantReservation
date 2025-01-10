//THis is working here

'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React, { useEffect, useState } from 'react';
// import { Constant } from '../../model'
import { Link, Session } from 'react-router-dom'

import axios from "axios";

import {dataFormat, setSessionData, sessionData, resetSessionData} from './../sharedData';
let dataVar: sessionData 
// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/'
});

// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [constants, setConstants] = React.useState<undefined>(undefined); // state from the AWS API
  const [errorMsgString, setErrMsgString] = React.useState('')
  const [successMsgString, setSuccessMsgString] = React.useState('')

  const [data, setData] = useState<sessionData>(dataFormat); 

  useEffect(() => {
    // Ensure this runs only on the client
    resetSessionData()
    sessionToReactData()
  }, []); // Runs only once on component mount

  const sessionToReactData = () => {
    if (data) {
      if (typeof window !== 'undefined') {
        let data = sessionStorage.getItem('sessionData');
        if (data) {
          setData(JSON.parse(data));
        }
      }
    }
  }

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

  function login() {
    let pin = document.getElementById("pinBox") as HTMLInputElement
    resetMessages()

    if (pin) {
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/login', {"pin" : pin.value.toString()})
      .then(function (response) {
        let status = response.data.statusCode

        if (status == 200) {
          setSuccessMsgString('Logged in successfully. Pin: ' + response.data.result.pin.toString())
          console.log("Success:", response.data.result.pin.toString())
          console.log("Data:", JSON.stringify(response.data))
          console.log("Status:", status)
          // let dataVar = structuredClone(data)
          // dataVar.pin = JSON.parse(response.data.result.pin)
          updateReactData({pin: JSON.parse(response.data.result.pin)})
          // dataVar.restaurant_ID = response.data.result.restaurant_ID
          // dataVar.name = response.data.result.name
          // dataVar.address = response.data.result.address
          // dataVar.description = response.data.result.description
          // dataVar.start_time = response.data.result.start_time
          // dataVar.end_time = response.data.result.end_time
          // dataVar.closed_days = response.data.result.closed_days
          // dataVar.active = response.data.result.active

          if(pin.value.toString() == "1234"){
            window.location.href = "/listRestaurantsAdmin";
          }
          else{
            window.location.href = "/restaurantManagerHome";
          }
          
        } else {
          setErrMsgString("Error: " + response.data.errorMessage)
          console.log(JSON.stringify(response.data))
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
        andRefreshDisplay()
      })
      .catch(function (error) {
        console.log(error)
        pin.value = ''
        setErrMsgString("Failed to log in. Please try again.")
        andRefreshDisplay()
      })
    }
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

  function resetMessages() {
    setErrMsgString('')
    setSuccessMsgString('')
  }

  return (
    <main className="flex flex-col items-center justify-between p-4">
      <div className="container text-center mb-4">
        <h1>Log in</h1>
      </div>
      <div className="container col-3 col-md-4 mb-4">
      {showError(errorMsgString)}
        <label className="form-label">Pin</label>
        <input className="form-control" type="text" id="pinBox"></input>
        <div className="form-text mb-4">
          Your pin comes in the following format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
        </div>
        <button className="btn btn-primary" type="button" onClick={(e) => login()}>Submit</button>
      </div>
    </main>
  )
}
//next-link
