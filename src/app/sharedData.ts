
export interface sessionData {
    pin: string,
    restaurant_ID : string,
    name : string,
    address : string,
    description : string,
    start_time : string,
    end_time : string,
    closed_days : string,
    active : boolean,
    table_ID : string
}

export function setSessionData(sessionData: object) {
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData)); // Serialize and store
}

//reset session data
export function resetSessionData() {
    sessionStorage.removeItem('sessionData');
}

export let dataFormat: sessionData = {
    pin: '',
    restaurant_ID: '',
    name: '',
    address: '',
    description: '',
    start_time: '',
    end_time: '',
    closed_days: '',
    active: false,
    table_ID: ''
}

//   export function retrieveSessionData() {
//     let data
//     if (window && window.sessionStorage) {
//       // do your stuff with sessionStorage
//       data = sessionStorage.getItem('sessionData')
//       if (data) data = JSON.parse(data)
//     }
//     return data
//   }
  