'use client'; // NEED THIS to be able to embed HTML in TSX file
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Restaurant, AvailabilityInfo } from '@/model';
import { dataFormat, setSessionData, sessionData, resetSessionData } from './../sharedData';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const instance = axios.create({
  baseURL: 'https://tlj3pip7h4.execute-api.us-east-1.amazonaws.com/initial/tables4U/',
  headers: {
   // 'Access-Control-Allow-Origin': '*'
  }
});

const loadingPlaceholder = () => {
  return(
  <>
    <div>
      <label>Select a date range to see restaurant availability.</label>
    </div>
  </>
  )}

function AvailabilityList(props: {availability_data: AvailabilityInfo | undefined, deleteReservation: (confirmation_ID: number) => void }) {
  const [showAvail, setShowAvail]= useState(false)
  const [redraw, forceRedraw] = React.useState(0); // used to conveniently request redraw after model change

  console.log(props.availability_data)


  const andRefreshDisplay = () => {
    forceRedraw(redraw + 1)
  }

  if (!props.availability_data) return loadingPlaceholder();

  return (
    <div>
      <div className='row'>
        <label>Percentages: </label>
        <label>Utility %: {props.availability_data.util_per}</label>
        <label>Availability %: {props.availability_data.avail_per} </label>
      </div>
      <div>
        <ul>
          {props.availability_data.date_array.map((date, index) => (
            <li key={date}>
              <b>{date}</b>
              {props.availability_data && props.availability_data.availability_list[index] && (
                <table className="table table-auto-bordered border">
                  <thead>
                    <tr>
                      {Array.isArray(props.availability_data.availability_list[index][0]) && props.availability_data.availability_list[index][0].map((header, headerIndex) => (
                        <th key={headerIndex} className="text-center">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {props.availability_data.availability_list[index].slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.isArray(row) && row.map((cell, cellIndex) => (
                          cellIndex === 0 || cell === 'open' ? (
                            <td key={cellIndex} className="text-center">{cell}</td>
                          ) : (
                            <td key={cellIndex} className="text-center"><button className="btn btn-danger" type="button" onClick={() => props.deleteReservation(parseInt(cell))}>Delete {cell}</button></td>
                          )
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

async function retrieveAvailabilityPercentages(restaurant_ID:string, start_date:string, end_date:string, start_time:string, end_time:string): Promise<[number, number]> {
    try {
      const response = await instance.post('/admin/listAvailbilityReport', {restaurant_ID, start_date, end_date, start_time, end_time,});
      if (response.data.statusCode === 200) {
        const percentages = response.data.result;
        console.log("util", percentages.util_per);
        console.log("avail", percentages.avail_per);
        return [percentages.util_per, percentages.avail_per];
      }
    } catch (error) {
      console.error(error);
    }
  
    return [-1, -1];
  }

async function retrieveAvailabilityReport(name:string, date:string): Promise<Array<String>> {

  try {
    const response = await instance.post('/manager/reviewDaysAvailbility', {name, date});
    if (response.data.statusCode === 200) {
      console.log("IM HERE:", response.data.result); 
      return response.data.result;
    }
  } catch (error) {
    console.error(error);
  }

  return []; 
}

const getDaysArray = function(start:string, end:string) {
  const dates = [];
    for(const dt=new Date(start); dt<=new Date(end);){
      let d = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));

      let month = '' + (d.getUTCMonth() + 1),
          day = '' + d.getUTCDate(),
          year = d.getUTCFullYear();
  
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
  
      dates.push([year, month, day].join('-'));
  
      // Increment date safely in UTC
      dt.setUTCDate(dt.getUTCDate() + 1);
  }
  return dates;
};

export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)       // used to conveniently request redraw after model change
  const [availability_data, setAvailabilityList] = useState<AvailabilityInfo|undefined>(undefined); // state from the AWS API
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [data, setData] = useState<sessionData>(dataFormat);
  const [errMsgString_cancelReservation, setErrMsgString_cancelReservation] = React.useState('')
  const [successMsgString_cancelReservation, setSuccessMsgString_cancelReservation] = React.useState('')
  function resetMessages() {
    setErrMsgString_cancelReservation('')
    setSuccessMsgString_cancelReservation('')
  }

  const handleSearch = async () => {
    let date_array = getDaysArray(start_date, end_date)
    let availability_table_data =  new Array<String[]>

    let [util_per, avail_per] = await retrieveAvailabilityPercentages(data.restaurant_ID, start_date, end_date, data.start_time, data.end_time); 

    for(let i = 0; i < date_array.length; i++){
      let availability_list = await retrieveAvailabilityReport("MAlice's Restaurant", date_array[i].toString()); //check converting correctly 
      availability_table_data.push(availability_list)
    }

    let availability_data = new AvailabilityInfo(util_per, avail_per, availability_table_data, date_array)
    console.log("Avail table", availability_table_data)
    setAvailabilityList(availability_data); 
  };

  const deleteReservation = async (confirmation_ID: number) => {
    resetMessages()
    try {
      const response = await instance.post('/consumer/cancelReservation', { "confirmation_ID": confirmation_ID });
      if (response.data.statusCode == 200) {
        setSuccessMsgString_cancelReservation("Reservation Cancelled")
      } else {
        setErrMsgString_cancelReservation("Error: " + response.data.error)
      }
      // Refresh the availability data after deletion
      handleSearch();
    } catch (error) {
      console.log(error);
    }
  };

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

  return (
    <main className="flex flex-col">
      <div className='flex items-center justify-between flex-col p-4'>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/home">Home</a></li>
            <li className="breadcrumb-item active" aria-current="page">RestaurantDetails</li>
          </ol>
        </nav>

        <div className="container text-center mb-4">
          <h1>{data.name}</h1>
          <br></br>
          <h2>Availability Report</h2>
        </div>
        <div>
          <label>Date Range:</label>
          <br />
          <input
            type="date"
            className="form-control"
            id="startDateBox"
            value={start_date}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <br />
          <input
            type="date"
            className="form-control"
            id="endDateBox"
            value={end_date}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <br />
          <button className="btn btn-primary" type="button" onClick={handleSearch}>Go!</button>
        </div>
      </div>

      <div className='container p-7'>
        <div className='row'>
          <AvailabilityList availability_data={availability_data} deleteReservation={deleteReservation} />
        </div>
      </div>
    </main>
  );
}