'use client'; // Allows embedding HTML in TSX
import React, { useEffect, useState } from 'react';
import { Restaurant } from '../../model';
import axios from "axios";
import { dataFormat, setSessionData, sessionData, resetSessionData } from './../sharedData';


import 'bootstrap/dist/css/bootstrap.min.css';

// Axios instance
const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {
    'access-control-allow-origin': '*',
  },
});

interface Props {
  restaurants: Restaurant[] | undefined,
  deleteRestaurant: (name: string) => void,
  activateRestaurant: (name: string) => void,
  handleEditRestaurant: (active: boolean) => void,
  handleFuture: (name: string, active: boolean) => void,
  openFuture: (name: string, date: string) => void,
  closeFuture: (date: string, id: string) => void
  handleReviewDaysAvailability: (name: string) => void
}




const RestaurantList: React.FC<Props> = (props) => {
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);


  const handleFuture = (restaurant: Restaurant, active: boolean) => {

    if (!active) {
      alert("This restaurant is not active- you cannot edit a future day!")
    } else {
      setSelectedRestaurant(restaurant);
      setShowPopup(true);
    }
  };


  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedRestaurant(null);

  };



  if (!props.restaurants) return (
    <div>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <ul className="list-unstyled">
        {props.restaurants.map((restaurant) => (
          <li key={restaurant.name} className="mb-3">
            <div className="card text-left" style={{ width: '25rem' }}>
              <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/89/3c/af/the-dining-room.jpg?w=600&h=-1&s=1" className="card-img-top" alt="Restaurant" />
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
                <div className="d-flex justify-content-center">

                  <a className="btn btn-outline-success me-2" onClick={() => props.activateRestaurant(restaurant.name)}>Activate</a>
                  <a className="btn btn-primary me-2" onClick={() => props.handleEditRestaurant(restaurant.active)}>Edit</a>
                  <a className="btn btn-danger me-2" onClick={() => props.deleteRestaurant(restaurant.name)}>Delete</a>

                  <a className="btn btn-success me-2" onClick={() => handleFuture(restaurant, restaurant.active)}>Edit Future</a>
                </div>

                <div className="p-1 g-col-6 " ></div>
                <div className="d-flex justify-content-center">

                  <a className="btn btn-info me-2 " onClick={() => props.handleReviewDaysAvailability(restaurant.name)}>Review Day's Availability</a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Popup */}
      {showPopup && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Future Day</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleClosePopup}></button>
              </div>
              <div className="modal-body">

                <div className="mb-3">
                  <label className="form-label">Input the Date you Would Like to Open/Close</label>
                  <input
                    type="date"
                    className="form-control"
                    id="newDateBox"
                    value={date} // Set date
                    onChange={(e) => setDate(e.target.value)} // Update date6
                  />
                  <button type="button" className="btn btn-success" onClick={() => {
                    if (selectedRestaurant) {
                      console.log("RESTAURANT id: ", selectedRestaurant.restaurant_ID)
                      props.openFuture(date, selectedRestaurant.restaurant_ID)
                    }

                    handleClosePopup()
                  }
                  }>Open Day</button>
                  <button type="button" className="btn btn-danger" onClick={() => {
                    if (selectedRestaurant) {
                      console.log("RESTAURANT id: ", selectedRestaurant.restaurant_ID)
                      props.closeFuture(date, selectedRestaurant.restaurant_ID)
                    }
                    handleClosePopup()
                  }
                  }>Close Day</button>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>


  );
}



// Main Component
export default function Home() {
  const [restaurant, setRestaurant] = useState<Restaurant[] | undefined>(undefined);

  const [data, setData] = useState<sessionData>(dataFormat);
  const [errorMsgString, setErrMsgString] = React.useState('')
  const [successMsgString, setSuccessMsgString] = React.useState('')
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change


  const [reviewDay, setReviewDay] = React.useState<string[][]>([]);




  const andRefreshDisplay = () => {
    forceRedraw(redraw + 1)
  }

  useEffect(() => {
    // Ensure this runs only on the client
    sessionToReactData()


  }, []); // Runs only once on component mount

  const sessionToReactData = () => {
    if (data) {
      if (typeof window !== 'undefined') {
        let data = sessionStorage.getItem('sessionData');
        if (data) {
          console.log(data)
          setData(JSON.parse(data));
        }
      }
    }
  }

  // Fetch restaurants based on user PIN
  async function retrieveRestaurant(
    setRestaurant: React.Dispatch<React.SetStateAction<Restaurant[] | undefined>>,
    user_pin: string
  ) {
    try {
      const response = await instance.get('/admin/listRestaurants');
      if (response.data.statusCode === 200) {
        const restaurants: Restaurant[] = response.data.result
          .filter((res: any) => res.pin === user_pin)
          .map((res: any) => new Restaurant(res.name, res.restaurant_ID, user_pin, res.address, res.description, res.start_time, res.end_time, res.closed_days, res.active, res.table_ID));

        console.log(restaurants);
        console.log(response.data.result);

        updateReactData({
          pin: user_pin,
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

        setRestaurant(restaurants);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const reactToSessionData = (newData: sessionData) => {
    setSessionData(newData);
  }

  function updateReactData(newData: Partial<sessionData>) {
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

  const userPin = data.pin;

  useEffect(() => {
    if (userPin && !restaurant) {
      retrieveRestaurant(setRestaurant, userPin);
    }
  }, [userPin, restaurant]);

  const activateRestaurant = async (name: string) => {
    resetMessages()
    try {
      await instance.post('/manager/activateRestaurant', { name });
      setRestaurant(undefined); // Triggers a re-fetch
      setSuccessMsgString("Restaurant Activated!")
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRestaurant = async (name: string) => {
    try {
      await instance.post('/manager/deleteRestaurant', { name, pin: userPin });
      setRestaurant(undefined); // Triggers a re-fetch
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditRestaurant = async (active: boolean) => {    // preventing editing of active restaurants
    if (active) {
      alert("This restaurant is currently active- you cannot edit it!")
    } else {
      window.location.href = '/editRestaurant4'
    }
  };


  const handleReviewDaysAvailability = async (name: string) => {    // preventing editing of active restaurants


    const date = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [month, day, year] = date.split('/');
    const currentDate = `${year}-${month}-${day}`;
    console.log("Current Date: ", currentDate);


    instance.post('/manager/reviewDaysAvailbility', { "name": name, "date": currentDate })
      .then(function (response) {
        let status = response.data.statusCode

        if (status == 200) {
          //update state with list of restaurants
          setReviewDay(response.data.result)
          //  setSuccessMsgString("Restaurants retrieved successfully.")
        } else {
          setErrMsgString("Error: " + response.data.error)
          console.log('test' + JSON.stringify(data))
        }
        andRefreshDisplay()
      })
      .catch(function (error) {

        setErrMsgString("Failed to retrieve restaurant availability. Please try again.")
        andRefreshDisplay()
      })





  };

  const handleFuture = (name: string, active: boolean) => { };


  const openFuture = async (date: string, id: string) => {
    try {
      console.log(`attempting to open future day: ${id}`);
      console.log(date)
      const response = await instance.post('/manager/openFutureDay', { "date": date, "restaurant_ID_day": id });
      console.log(response.data.statusCode)

      console.log(response)
      setRestaurant(undefined); // Triggers a re-fetch
      if (response.data.statusCode === 200) {
        setSuccessMsgString("Future Day Opened!")
        setRestaurant(undefined); // Triggers a re-fetch

      } else {
        setErrMsgString("Future Day could not be Opened!")
      }

    } catch (error) {
      console.error(error);
    }

  }

  const closeFuture = async (date: string, id: string) => {
    try {
      console.log(`attempting to close future day: ${id}`);
      console.log(date)
      const response = await instance.post('/manager/closeFutureDay', { "date": date, "restaurant_ID_day": id });
      console.log(response.data.statusCode)

      console.log(response)
      setRestaurant(undefined); // Triggers a re-fetch
      if (response.data.statusCode === 200) {
        setSuccessMsgString("Future Day Closed!")
        setRestaurant(undefined); // Triggers a re-fetch

      } else {
        setErrMsgString("Future Day could not be closed!")
      }

    } catch (error) {
      console.error(error);
    }

  }




  function showError(errorMsg: string) {
    if (errorMsg !== '') {
      console.log("Error:", errorMsg)
      return <div className="alert alert-danger" role="alert">{errorMsg}</div>
    }
    else {
      return null
    }
  }

  function showSuccess(successMsg: string) {
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
      <div className="container items-center mb-4">
        {showError(errorMsgString)}
        {showSuccess(successMsgString)}
        <div className="container text-center mb-4">
          <h1><u>My Restaurant</u></h1>
          <br />
          <RestaurantList
            restaurants={restaurant}
            deleteRestaurant={deleteRestaurant}
            activateRestaurant={activateRestaurant}
            handleEditRestaurant={handleEditRestaurant}
            handleFuture={handleFuture}
            openFuture={openFuture}
            closeFuture={closeFuture}
            handleReviewDaysAvailability={handleReviewDaysAvailability}

          />
        </div>
        {errorMsgString && <div className="error">{errorMsgString}</div>}
        {successMsgString && <div className="success">{successMsgString}</div>}
        <table className="table table-auto-bordered border">
          <thead>
            <tr>
              {reviewDay[0] && reviewDay[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviewDay.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}

