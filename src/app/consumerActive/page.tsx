'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React, { useEffect } from 'react'
// import { Restaurant } from '../../model'
import { Link } from 'react-router-dom'

import axios from "axios";
import { Result } from 'postcss';

// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  
  
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

interface Restaurant {
  name: string;
  address: string;
  description: string;
  start_time: string;
  end_time: string;
  closed_days: string;
  active: string;
}


// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([])  // State to store the list of restaurants
  const [errorMsgString, setErrMsgString] = React.useState('')
  const [successMsgString, setSuccessMsgString] = React.useState('')

  const andRefreshDisplay = () => {
    forceRedraw(redraw + 1)
  }

  function listActiveRestaurant() {
    instance.get('/consumer/listActiveRestaurants')
      .then(function (response) {
        let status = response.data.statusCode

        if (status == 200) {
          //update state with list of restaurants
          setRestaurants(response.data.result)
          setSuccessMsgString("Restaurants retrieved successfully.")
        } else {
          setErrMsgString("Error: " + response.data.error)
        }
        andRefreshDisplay()
      })
      .catch(function (error) {

        setErrMsgString("Failed to retrieve restaurant. Please try again.")
        andRefreshDisplay()
      })
  }
  useEffect(() => {
    listActiveRestaurant()
  }, [])


  const availbleRestaurants = async () => {
     window.location.href='/listAvailbleRestaurants'
  };
  const specificRestaurants = async () => {
    window.location.href='/listSpecificRestaurant'
 };

  return (
    <main className="flex flex-col items-center justify-between p-4">
      {/* Header*/}
      <div className="container text-center mb-4">
        <h1>Restaurants</h1>
      </div>
      <div className="container d-flex justify-content-center mb-4">
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary me-2" type="button" onClick={(e) => availbleRestaurants()}>Available Restaurants</button>
          <button className="btn btn-primary" type="button" onClick={(e) => specificRestaurants()}>Specific Restaurant</button>
        </div>
      </div>
      <div className="container">
      <div className="d-flex justify-content-center">
        { !restaurants.length ? (
        <div className="spinner-border m-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>) : null }
      </div>
        <div className="row">
          {restaurants.map((restaurant, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card text-left" style={{ width: '100%' }}>
                <img
                  src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/89/3c/af/the-dining-room.jpg?w=600&h=-1&s=1"
                  className="card-img-top"
                  alt="Restaurant"
                />
                <div className="card-body">
                  <h5 className="card-title">{restaurant.name}</h5>
                  <p className="card-text">{restaurant.description}</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">Start Time: {restaurant.start_time}</li>
                  <li className="list-group-item">End Time: {restaurant.end_time}</li>
                  <li className="list-group-item">Address: {restaurant.address}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
//next-link
