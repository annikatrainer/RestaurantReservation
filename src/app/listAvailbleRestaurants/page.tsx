'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from '@/model';
import { Restaurant } from '@/model';
import { start } from 'repl';

const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {},
});

const loadingPlaceholder = () => (
  <>
    {[...Array(3)].map((_, index) => (
      <div className="col-md-4 mb-4" key={index}>
        <div className="card" aria-hidden="true">
          <svg
            className="bd-placeholder-img card-img-top"
            width="100%"
            height="180"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Placeholder"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
          >
            <rect width="100%" height="100%" fill="#868E96"></rect>
          </svg>
          <div className="card-body">
            <h5 className="card-title placeholder-glow">
              <span className="placeholder col-6"></span>
            </h5>
            <p className="card-text placeholder-glow">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-6"></span>
              <span className="placeholder col-8"></span>
            </p>
            <a className="btn btn-primary disabled placeholder col-6" aria-disabled="true"></a>
          </div>
        </div>
      </div>
    ))}
  </>
);

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | undefined>(undefined);
  const [tables, setTables] = useState<Table[] | undefined>(undefined);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [num_seats, setNum_Seats] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsgString_makeReservation, setErrMsgString_makeReservation] = useState('');
  const [successMsgString_makeReservation, setSuccessMsgString_makeReservation] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restId, setRestId] = useState('');
  const [st, setSt] = useState('');
  const [et, setEt] = useState('');

  const handleSearch = () => {
    retrieveRestaurants(time, date, setRestaurants);
    setLoading(false);
  };

  const handleSearch2 = (restaurant_ID: string) => {
    const numSeatsRcv = document.getElementById(`numSeatsBox_${restaurant_ID}`) as HTMLInputElement;
    const emailRcv = document.getElementById(`emailBox_${restaurant_ID}`) as HTMLInputElement;
    setNum_Seats(numSeatsRcv.value);
    setEmail(emailRcv.value);
    retrieveTables(restaurant_ID, time, date, numSeatsRcv.value, emailRcv.value, setTables);
  };

  const retrieveRestaurants = (
    time: string,
    date: string,
    setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>
  ) => {
    instance.post('/consumer/listAvailble', { time, date })
      .then((response) => {
        if (response.data.statusCode === 200) {
          const restaurants = response.data.result.map((resArray: any[]) => {
            const res = resArray[0];
            return new Restaurant(res.name, res.restaurant_ID, res.pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID);
          });
          setRestaurants(restaurants);
        }
      })
      .catch(console.error);
  };

  const retrieveTables = (
    restID: string,
    time: string,
    date: string,
    numSeats: string,
    email: string,
    setTables: React.Dispatch<React.SetStateAction<Table[] | undefined>>
  ) => {
    instance.post('/consumer/listAvailbleTables', { time, date, restaurant_ID: restID })
      .then((response) => {
        if (response.data.statusCode === 200) {
          const tables = response.data.result.flatMap((resArray: any[]) =>
            resArray.map((res: any) => new Table(res.table_num, res.num_seats, res.table_ID, res.restaurant_ID))
          );
          setTables(tables);
        }
      })
      .catch(console.error);
  };

  const createReservation = (table_ID: number, restId: string, start_time: string, end_time: string) => {
    instance.post('/consumer/createReservation', {
      date,
      time,
      num_guests: num_seats,
      email,
      restaurant_ID_reser: restId, // Example hardcoded value
      table_ID,
      closing_time: end_time,
      start_time: start_time,
    })
      .then((response) => {
        if (response.data.statusCode === 200) {
          setSuccessMsgString_makeReservation(`Confirmation Code is ${response.data.result.confirmation_ID.insertId}`);
        } else {
          setErrMsgString_makeReservation(`Error: ${response.data.error}`);
        }
      })
      .catch(console.error);
  };

  const ActiveRestaurantList = (props: { restaurants: Restaurant[] | undefined }) => {
    if (!props.restaurants) return loading && loadingPlaceholder();

    return (
      <div className="container">
        <div className="row">
          {props.restaurants.map((restaurant) => (
            <div className="col-md-4 mb-4" key={restaurant.restaurant_ID}>
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
                <div className="card-body">
                  <button
                    className="btn btn-outline-success me-2"
                    onClick={() => {
                      setActiveModal(restaurant.restaurant_ID);
                      setRestId(restaurant.restaurant_ID);
                      setSt(restaurant.start_time);
                      setEt(restaurant.end_time);
                      setTables(undefined);
                    }}
                  >
                    Reserve
                  </button>
                </div>
              </div>
              {activeModal === restaurant.restaurant_ID && (
                <div className="modal fade show d-block" tabIndex={-1}>
                  <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Reserve at <b>{restaurant.name}</b></h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setActiveModal(null)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div className="container col-3 col-md-4 mb-4">
                          <label className="form-label">Number of Seats</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={num_seats}
                            id={`numSeatsBox_${restaurant.restaurant_ID}`}
                          />
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            defaultValue={email}
                            id={`emailBox_${restaurant.restaurant_ID}`}
                          />
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => handleSearch2(restaurant.restaurant_ID)}
                          >
                            Search Tables
                          </button>
                        </div>
                        <div className="row">
                          <ActiveTableList
                            tables={tables}
                            createReservation={createReservation}
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setActiveModal(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ActiveTableList = (props: { tables: Table[] | undefined; createReservation: (table_ID: number, restId: string, start_time: string, end_time: string) => void }) => {
    if (!props.tables) return(
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border m-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
    return (
      <div className="container">
      <div className="row">
        {props.tables.map((table) => (
          <div className="col-md-6 mb-4" key={table.table_ID}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Seats available: {table.num_seats}</h5>
                <p className="card-text">Table number: {table.table_num}</p>
                <p className="card-text">Table id: {table.table_ID}</p>
                <button className="btn btn-success" onClick={() => {props.createReservation(table.table_ID, restId, st, et); setActiveModal(null)}}>Reserve</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <main className="flex flex-col">
      <div className='flex items-center justify-between flex-col p-4'>
        <div className="container text-center mb-4">
          <h1>Available Restaurants</h1>
        </div>
        <div className="container col-3 col-md-4 mb-4">
        {errorMsgString_makeReservation && (<div className="alert alert-danger" role="alert">{errorMsgString_makeReservation}</div>)}
        {successMsgString_makeReservation && (<div className="alert alert-success" role="alert">{successMsgString_makeReservation}</div>)}
          <label className="form-label">Time</label>
          <input
            type="time"
            className="form-control"
            id="timeBox"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <label className="form-label">New Date</label>
          <input
            type="date"
            className="form-control"
            id="newDateBox"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="btn btn-primary mt-2" type="button" onClick={() => {handleSearch(); setLoading(true)}}>Search</button>
        </div>
      </div>
      <div className='container p-7'>
        <div className='row'>
          <ActiveRestaurantList restaurants={restaurants} />
        </div>
      </div>
    </main>
  );
}
