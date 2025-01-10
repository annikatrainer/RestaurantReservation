'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React from 'react'
// import { Restaurant } from '../../model'
import { Link } from 'react-router-dom'

import axios from "axios";
import { Result } from 'postcss';

// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  // headers: {
  //   'Access-Control-Allow-Origin' :  '*'
  // }
});

// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [errorMsgString, setErrMsgString] = React.useState('')
  const [successMsgString, setSuccessMsgString] = React.useState('')
  
  // utility method (that can be passed around) for refreshing display in React
  const andRefreshDisplay = () => {
      forceRedraw(redraw+1)
  }

  function createRestaurant() {

    // JSON Format Reference
    // {
    //   "name": "Taco insane",
    //   "address": "blah blah blah",
    //   "description": "A nice places",
    //   "start_time": "12:00",
    //   "end_time": "14:00",
    //   "closed_days": "12-04-2024",
    //   "active": "true"
    // }

    let name = document.getElementById("nameBox") as HTMLInputElement
    let address = document.getElementById("addressBox") as HTMLInputElement
    let description = document.getElementById("descriptionBox") as HTMLInputElement
    let start_time = 'T12:00:00'
    let end_time = 'T12:00:00'
    let closed_days = '12-04-2024'
    let active = false
    resetMessages()

    if (name && address && description) {
      
      // Access the REST-based API and in response (on a 200 or 400) process.
      instance.post('/createRestaurant', {'name':name.value, 'address':address.value, 'description':description.value, 'start_time':start_time, 'end_time':end_time, 'closed_days':closed_days, 'active':active})
      .then(function (response) {
        let status = response.data.statusCode
        let result = document.getElementById("result") as HTMLInputElement

        if (status == 200) {
          setSuccessMsgString("Restaurant created successfully. Pin: " + response.data.result.pin.toString())
        } else {
          setErrMsgString("Error: " + response.data.error)
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
        andRefreshDisplay()
      })
      .catch(function (error) {
        console.log(error)
        setErrMsgString("Failed to create restaurant. Please try again.")
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
        <h1>Create a Restaurant</h1>
      </div>
      <div className="container col-3 col-md-4 mb-4">
        {showError(errorMsgString)}
        {showSuccess(successMsgString)}
        <label className="form-label">Name</label>
        <input className="form-control" type="text" id="nameBox"></input>
          <label className="form-label">Address</label>
          <input className="form-control" type="text" id="addressBox"></input>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" id="descriptionBox" rows={5}></textarea>
          </div>
        <button className="btn btn-primary" type="button" onClick={(e) => createRestaurant()}>Submit</button>
      </div>
    </main>
  )
}
//next-link
