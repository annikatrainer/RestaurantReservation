'use client'; // NEED THIS to be able to embed HTML in TSX file
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Reservation } from '@/model';

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
  const [redraw, forceRedraw] = React.useState(0); // used to conveniently request redraw after model change
  const [reservations, setReservations] = useState<Reservation[] | undefined>(undefined); // state from the AWS API
  const [resId, setResId] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsgString_cancelReservation, setErrMsgString_cancelReservation] = React.useState('')
  const [successMsgString_cancelReservation, setSuccessMsgString_cancelReservation] = React.useState('')
  const [loading, setLoading] = useState(false);

  function ActiveReservationList(props: { reservations: Reservation[] | undefined, deleteReservation: (confirmation_ID: number) => void }) {
    const [state, setState] = useState(false);
  
    useEffect(() => {
      if (props.reservations) {
        setState(true);
      }
    }, [props.reservations]);
  
    if (!props.reservations) return loading && (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  
    return (
      <div className="container d-flex justify-content-center align-items-center">
          {props.reservations.map(reservation => (
            <div className="col-md-4 mb-4" key={reservation.confirmation_ID}>
              <div className="card text-left" style={{ width: '100%', borderRadius: '0.25rem' }}>
                <div className="card-body">
                  <h5 className="card-title">Reservation Details</h5>
                  <p className="card-text"><b>Email:</b> {reservation.email}</p>
                  <p className="card-text"><b>Confirmation ID:</b> {reservation.confirmation_ID.toString()}</p>
                  <p className="card-text"><b>Date:</b> {reservation.date.toDateString()}</p>
                  <p className="card-text"><b>Time:</b> {reservation.time}</p>
                  <p className="card-text"><b>Number of Guests:</b> {reservation.num_guests}</p>
                  <p className="card-text"><b>Restaurant ID:</b> {reservation.restaurant_ID_reser}</p>
                  <p className="card-text"><b>Table ID:</b> {reservation.table_ID}</p>
                  <button className="btn btn-danger" onClick={() => props.deleteReservation(reservation.confirmation_ID)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  const handleSearch = () => {
    retrieveReservations(resId, email, setReservations);
  };

  const andRefreshDisplay = () => {
    forceRedraw(redraw + 1);
  };

  function retrieveReservations(time: string, date: string, setReservations: React.Dispatch<React.SetStateAction<Reservation[] | undefined>>) {
    resetMessages()
    instance.post('/consumer/findReservation', { 'confirmation_ID': time, 'email': date })
      .then(function (response) {
        let status = response.data.statusCode;

        if (status === 200) {
          console.log(time);
          console.log(date);
          console.log("IM HERE:", response.data);

          // Assuming response.data is the array
          let rets: Array<Reservation> = [];
          let resArray = response.data.result;
          let res = resArray[0];
          console.log('this:' + res.email);
          console.log(response.data.result.email);
          rets.push(new Reservation(res.confirmation_ID, new Date(res.date), res.time, res.num_guests, res.email, res.restaurant_ID_reser, res.table_ID));
          console.log(rets);
          setReservations(rets);
        }
        else {
          setErrMsgString_cancelReservation("Error: " + response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    andRefreshDisplay();
  }

  function deleteRestaurant(confirmation_ID: number) {
    resetMessages()
    // Access the REST-based API and in response (on a 200 or 400) process.
    instance.post('/consumer/cancelReservation', { "confirmation_ID": confirmation_ID })
      .then(function (response) {
        // not sure what to do ON failure?
        console.log("attempting delete");
        console.log(confirmation_ID);
        console.log(response.data.statusCode);
        if (response.data.statusCode == 200) {
          setSuccessMsgString_cancelReservation("Reservation Cancelled")
        } else {
          setErrMsgString_cancelReservation("Error: " + response.data.error)
        }
        // force reload of constants. Do so by clearing out constants and refreshing display
        setReservations(undefined); //CHANGE THIS 
        andRefreshDisplay();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function removeRestaurant(confirmation_ID: number) {
    deleteRestaurant(confirmation_ID);
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
    setErrMsgString_cancelReservation('')
    setSuccessMsgString_cancelReservation('')
  }

  return (
    <main className="flex flex-col">
      {/* Header */}
      <div className='flex items-center justify-between flex-col p-4'>
        <div className="container text-center mb-4">
          <h1>Find Reservation</h1>
        </div>
        <div className="container col-3 col-md-4 mb-5">
        {showError(errorMsgString_cancelReservation)}
        {showSuccess(successMsgString_cancelReservation)}
          <label className="form-label">Reservation ID</label>
          <input
            type="text"
            className="form-control"
            id="resIdBox"
            value={resId}
            onChange={(e) => setResId(e.target.value)}
          />
          <label className="form-label">Email</label>
          <input
            type="text"
            className="form-control"
            id="emailBox"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary mt-2" type="button" onClick={() => {handleSearch(); setLoading(true)}}>Search</button>
        </div>
        <div className='container'>
          <ActiveReservationList reservations={reservations} deleteReservation={removeRestaurant} />
        </div>
      </div>
    </main>
  );
}