'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React, { useState } from 'react'
import { Restaurant } from '../../model'
import { Link } from 'react-router-dom'

import axios from "axios";
import { Result } from 'postcss';

import {dataFormat, setSessionData, sessionData, resetSessionData} from './../sharedData';

// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {
    'access-control-allow-origin' :  '*'
  }
});


// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [restaurants, setRestaurants] = React.useState<Restaurant[] | undefined>(undefined); // state from the AWS API
  const [ret_active, setRetActive] = React.useState<Restaurant[] | undefined>(undefined); // Active restaurants
  const [ret_inactive, setRetInactive] = React.useState<Restaurant[] | undefined>(undefined); // Inactive restaurants
  const [errorMsgString, setErrMsgString] = React.useState('')
  const [successMsgString, setSuccessMsgString] = React.useState('')

  const [data, setData] = useState<sessionData>(dataFormat); 
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

  async function openDetails(user_pin: string) {
        try {
          const response = await instance.get('/admin/listRestaurants');
          if (response.data.statusCode === 200) {
            const restaurants: Restaurant[] = response.data.result
              .filter((res: any) => res.pin === user_pin)
              .map((res: any) => new Restaurant(res.name, res.restaurant_ID, user_pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID));
    
            console.log(restaurants);
            console.log(response.data.result);
    
            updateReactData({
              restaurant_ID: restaurants[0]?.restaurant_ID,
              name: restaurants[0]?.name,
              address: restaurants[0]?.address,
              description: restaurants[0]?.description,
              start_time: restaurants[0]?.start_time,
              end_time: restaurants[0]?.end_time,
              closed_days: restaurants[0]?.closed_days,
              active: restaurants[0]?.active,
              table_ID: restaurants[0]?.table_ID
            });
    
            window.location.href = "/adminRestaurantDetails";
          }
        } catch (error) {
          console.error(error);
        }
    
  }

  
  // The "props" passed in contains properties from "higher up" in the system that we need to render here.
// These are the array of constants as stored in the model. This function will return 
function ActiveRestaurantList(props: {restaurants: Restaurant[] | undefined, deleteRestaurant: (name:string) => void}) {
  // if "not yet set" then simply show "Loading..."
  if (!props.restaurants) return(
    <div>
        <ul>
          <div className="card" style={{ width: '30rem' }}>
          <div className="card-header">
              <h5><b>Active</b></h5>
            </div>
            <ul className="list-group items-center list-group-flush">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </ul>
          </div>
        </ul>  
    </div>
  )

  // For each constant in 'props.constants', generate a <li> ... </li> block containing name and value
  return (
  <ul>
    <div className="card" style={{ width: '30rem' }}>
    <div className="card-header">
        <h5><b>Active</b></h5>
      </div>
      <ul className="list-group list-group-flush">
      {props.restaurants.map((restaurant) => (
          <li className="list-group-item" key={restaurant.name}>
            <div className="d-flex justify-content-between align-items-center">
              <span>{restaurant.name}</span>
              <div>
                <button className="btn btn-secondary me-2" onClick={() => openDetails(restaurant.pin)}>Details</button>
                <button className="btn btn-danger" onClick={() => props.deleteRestaurant(restaurant.pin)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </ul>  
  )
}

function InactiveRestaurantList(props: {restaurants: Restaurant[] | undefined, deleteRestaurant: (name:string) => void}) {
  // if "not yet set" then simply show "Loading..."
  if (!props.restaurants) return (
    <div>
        <ul>
          <div className="card" style={{ width: '30rem' }}>
          <div className="card-header">
              <h5><b>Inactive</b></h5>
            </div>
            <ul className="list-group items-center list-group-flush">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </ul>
          </div>
        </ul>  
    </div>
  )

  // For each constant in 'props.constants', generate a <li> ... </li> block containing name and value
  return (
<ul>
    <div className="card" style={{ width: '30rem' }}>
      <div className="card-header">
        <h5><b>Inactive</b></h5>
      </div>
      <ul className="list-group list-group-flush">
      {props.restaurants.map((restaurant) => (
          <li className="list-group-item" key={restaurant.name}>
            <div className="d-flex justify-content-between align-items-center">
              <span>{restaurant.name}</span>
              <div>
              <button className="btn btn-secondary me-2" onClick={() => openDetails(restaurant.restaurant_ID)}>Details</button>
                <button className="btn btn-danger" onClick={() => props.deleteRestaurant(restaurant.name)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </ul> 
  )
}


// NOTE: this function makes an async call to the REST-based API and once retrieved, it 
// calls the "setConstants" callback function (which was passed in as an argument) to set the values.
function retrieveRestaurants(
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>,
  setRetActive: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>,
  setRetInactive: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>) {
  instance.get('/admin/listRestaurants')
    .then(function (response) {
      let status = response.data.statusCode

      if (status == 200) {
        console.log("IM HERE:", response.data.result)
        let ret_active:Array<Restaurant> = []
        let ret_inactive:Array<Restaurant> = []
        for (let res of response.data.result) {
          if(res.active == true){
            ret_active.push(new Restaurant(res.name, res.restaurant_ID, res.pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID))
            console.log("ACTIVE:", res.name)
          }
          else{
            ret_inactive.push(new Restaurant(res.name, res.restaurant_ID, res.pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID))
            console.log("INACTIVE:", res.name)
          }
          
        }
        setRestaurants(response.data.result)
        setRetActive(ret_active)
        setRetInactive(ret_inactive)
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}
  // Whenever 'redraw' changes (and there are no loaded constants) this fetches from API
  React.useEffect( () => {
    if (!restaurants) {
      retrieveRestaurants(setRestaurants, setRetActive, setRetInactive)
      console.log("restaurants:", restaurants)
    }
  }, [redraw])

  // utility method (that can be passed around) for refreshing display in React
  const andRefreshDisplay = () => {
      forceRedraw(redraw+1)
  }


  // function showSuccess(successMsg:string) {
  //   if (successMsg !== '') {
  //     console.log("Success:", successMsg)
  //     return <div className="alert alert-success" role="alert">{successMsg}</div>
  //   }
  //   else {
  //     return null
  //   }
  // }

  // function resetMessages() {
  //   setErrMsgString('')
  //   setSuccessMsgString('')
  // }

  function deleteRestaurant(name:string) {
    // Access the REST-based API and in response (on a 200 or 400) process.
    instance.post('/admin/deleteRestaurant', {"name":name, "pin":"1234"})
    
    .then(function (response) {
      // not sure what to do ON failure?
      console.log("attempting delete")
      // force reload of constants. Do so by clearing out constants and refreshing display
      setRestaurants(undefined) //CHANGE THIS 
      andRefreshDisplay()
    })
    .catch(function (error) {
      console.log(error)
    })
  }

  function removeRestaurant(name:string) {
    deleteRestaurant(name)
  }

  return (
    <main className="flex flex-col items-center justify-between p-4">
      <div className="container text-center mb-4">
        <h1><u>Restaurants</u></h1>
        <br />
        <div className="d-flex justify-content-center">
          <div className="flex-item text-center">
            <ActiveRestaurantList restaurants={ret_active} deleteRestaurant={removeRestaurant} />
          </div>
          <div className="flex-item text-center">
            <InactiveRestaurantList restaurants={ret_inactive} deleteRestaurant={removeRestaurant} />
          </div>
        </div>
      </div>
    </main>
  )
}
//next-link
