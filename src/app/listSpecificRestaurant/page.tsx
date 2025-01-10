'use client'; // NEED THIS to be able to embed HTML in TSX file
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Restaurant } from '@/model';
import { Table } from '@/model';

// all WEB traffic using this API instance. You should replace this endpoint with whatever
// you developed for the tutorial and adjust resources as necessary.
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {
   // 'Access-Control-Allow-Origin': '*'
  }
});





// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [restaurants, setRestaurants] = useState<Restaurant[] | undefined>(undefined); // state from the AWS API
  const [tables, setTables] = useState<Table[] | undefined>(undefined); // state from the AWS API
  const [time, setTime] = useState(''); //ANNIKA NAME OF RESTAURANT
  const [date, setDate] = useState('');
  const [num_seats, setNum_Seats] = useState('');
  const [email, setEmail] = useState('');
  const [time2, setTime2] = useState(''); //ANNIKA TIME
  const [errorMsgString_makeReservation, setErrMsgString_makeReservation] = React.useState('')
  const [successMsgString_makeReservation, setSuccessMsgString_makeReservation] = React.useState('')
  const [errorMsgString_searchTables, setErrMsgString_searchTables] = React.useState('')
  const [successMsgString_searchTables, setSuccessMsgString_searchTables] = React.useState('')
  const [name, setName] = useState(''); 
  const [restId, setRestId] = useState('');
  const [st, setSt] = useState('');
  const [et, setEt] = useState('');


  function ActiveRestaurantList(props: { restaurants: Restaurant[] | undefined }) {
    const [state, setState] = useState(false);
  
    useEffect(() => {
      if (props.restaurants) {
        setState(true);
      }
    }, [props.restaurants]);
    
    if (!props.restaurants) return <div>Loading...</div>;
  
    return (
      <ul>
        {props.restaurants.map(restaurant => (
          <li key={restaurant.name}>
            <b>{restaurant.name}</b>
          </li>
        ))}
      </ul>
    );
  }
  function ActiveTableList(props: { tables: Table[] | undefined, deleteRestaurant: ( table_ID: number) => void }) {
    const [state, setState] = useState(false);
  
    useEffect(() => {
      if (props.tables) {
        setState(true);
      }
    }, [props.tables]);
  
    if (!props.tables) return <div>No Tables Found</div>;
    props.tables.forEach(table => {
      console.log(table.table_num);
    });
  
    return (
      <ul>
        {props.tables.map(table => (
          <li key={table.table_ID}>
            <b>Seats: {table.num_seats}</b>
            <div>Table ID: {table.table_ID}</div>
            <div>Table Number: {table.table_num}</div>
           <button className="btn btn-danger" onClick={() => props.deleteRestaurant(table.table_ID)}>Reserve</button>
          </li>
        ))}
      </ul>
    );
  }
  
  function retrieveRestaurants(time: string, date: string, setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>) {
    instance.post('/consumer/listSpecific', {'name':name, 'date':date})
      .then(function (response) {
        let status = response.data.statusCode;
  
        if (status === 200) {
          console.log(time)
          console.log(date)
          console.log("IM HERE:", response.data);
          console.log(response.data.result)
          let rets: Array<Restaurant> = [];
          if (Array.isArray(response.data.result)) {
            for (let res of response.data.result) {
              if (res && res.name) {
                console.log("hello");
                console.log(res.name);
                rets.push(new Restaurant(res.name, res.restaurant_ID, res.pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID));
                setRestId(res.restaurant_ID);
                setSt(res.start_time);
                setEt(res.end_time);
              }
            }
          }
          setRestaurants(rets);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function retrieveTables(time2: string, date: string, setTables: React.Dispatch<React.SetStateAction<Table[] | undefined>>) {
    instance.post('/consumer/listAvailbleTables', { 'time': time2, 'date': date, 'restaurant_ID': restId })
      .then(function (response) {
        let status = response.data.statusCode;
        if (status === 200) {
          console.log(time2);
          console.log(date);
          console.log("IM HERE:", response.data);
          console.log(response.data.result);
          let rets: Array<Table> = [];
          for (let resArray of response.data.result) {
            for (let res of resArray) {
              console.log(res);
              console.log("bye "+ res.table_ID)
              rets.push(new Table(res.table_num, res.num_seats, res.table_ID, res.restaurant_ID));
            }
          }
          setTables(rets);
          setSuccessMsgString_searchTables("Tables:")
          console.log("hello", rets);
        } else{
          console.log(status)
          setErrMsgString_searchTables("Error: " + response.data.error)
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // if (status == 400) 

  const handleSearch = () => {
    retrieveRestaurants(time, date, setRestaurants);
  };
  const handleSearch2 = () => {
    retrieveTables(time2, date, setTables);
  };
  function removeRestaurant(table_ID: number) {
    deleteRestaurant(table_ID);
  }
  function deleteRestaurant(table_ID: number) {
    // Access the REST-based API and in response (on a 200 or 400) process.
    instance.post('/consumer/createReservation', { "date": date, "time":time2, "num_guests": num_seats, "email": email, "restaurant_ID_reser": restId, "table_ID": table_ID, "start_time": st, "closing_time": et}) //THIS IS HARDCOEEED
      .then(function (response) {
        // not sure what to do ON failure?
        console.log("attempting delete");
        console.log(response.data.statusCode);
        console.log(response.data)
        console.log(date, time2, num_seats, email, restId, table_ID, st, et)
        if (response.data.statusCode == 200) {
          setSuccessMsgString_makeReservation("Confirmation Code is "+ response.data.result.confirmation_ID.insertId)
        } else {
          setErrMsgString_makeReservation("Error: " + response.data.error)
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
      })
      .catch(function (error) {
        console.log(error);
      });
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
  function showError_searchTables(errorMsg:string) {
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
  function showSuccess_searchTables(successMsg:string) {
    if (successMsg !== '') {
      console.log("Success:", successMsg)
      return <div className="alert alert-success" role="alert">{successMsg}</div>
    }
    else {
      return null
    }
  }

  return (
    <main className="flex flex-col items-center justify-between p-4">
      {/* Header */}
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          id="nameBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          id="dateBox"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <button className="btn btn-primary" type="button" onClick={handleSearch}>
          Search
        </button>
        <ActiveRestaurantList restaurants={restaurants} />
      </div>
      <div className="mb-3">
            <label className="form-label">Number of Seats</label>
            <input
              type="text"
              className="form-control"
              id="numSeatsBox"
              value={num_seats}
              onChange={(e) => setNum_Seats(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="emailBox"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              id="timeBox"
              value={time2}
              onChange={(e) => setTime2(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={handleSearch2}>Search Tables</button>
          <div className='container p-7'>
          {showError_searchTables(errorMsgString_searchTables)}
          {showSuccess_searchTables(successMsgString_makeReservation)}
        <div className='row'>
        <ActiveTableList tables={tables} deleteRestaurant={removeRestaurant} />
        </div>
      </div>
      {showError(errorMsgString_makeReservation)}
      {showSuccess(successMsgString_makeReservation)}
    </main>
  );
}