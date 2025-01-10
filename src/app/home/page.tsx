'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React from 'react'
// import { Restaurant } from '../../model'
import { Link } from 'react-router-dom'

import axios from "axios";
import { Result } from 'postcss';
import '../sharedData';

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

  // const pin = sessionStorage.getItem('pin')

  return (
  <div className="container my-5">
    <div className="p-5 text-center bg-body-tertiary rounded-3 d-flex flex-column align-items-center justify-content-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-egg-fried mt-4 mb-3" viewBox="0 0 16 16">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
        <path d="M13.997 5.17a5 5 0 0 0-8.101-4.09A5 5 0 0 0 1.28 9.342a5 5 0 0 0 8.336 5.109 3.5 3.5 0 0 0 5.201-4.065 3.001 3.001 0 0 0-.822-5.216zm-1-.034a1 1 0 0 0 .668.977 2.001 2.001 0 0 1 .547 3.478 1 1 0 0 0-.341 1.113 2.5 2.5 0 0 1-3.715 2.905 1 1 0 0 0-1.262.152 4 4 0 0 1-6.67-4.087 1 1 0 0 0-.2-1 4 4 0 0 1 3.693-6.61 1 1 0 0 0 .8-.2 4 4 0 0 1 6.48 3.273z"/>
      </svg>
      <h1 className="text-body-emphasis">Welcome to Tables<b>4u</b>!</h1>
      <p className="col-lg-8 mx-auto fs-5 text-muted mb-5">
        Start the best culinary experience of Worcester by making a reservation today.
      </p>
      <div className="d-inline-flex gap-2 mb-5">
        <a className="d-inline-flex align-items-center btn btn-primary btn-lg px-4 rounded-pill" type="button" href='/consumerActive'>
          Look for restaurants
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi ms-2 bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg>
        </a>
        <a className="btn btn-outline-secondary btn-lg px-4 rounded-pill" type="button" href='/login'>
          Login
        </a>
      </div>
    </div>
  </div>
  )
}


//next-link
