/**
 * What you will find is that the Model class "vanishes" with your React application, and the
 * top-level React GUI object (i.e., the top-level boundary object) will maintain references
 * to the state that it works with.
 */
export class Restaurant {
    name:string
    restaurant_ID:string
    pin: string
    address: string
    description: string
    start_time: string
    end_time: string
    closed_days: string
    active: boolean
    table_ID: string
    //There will be more here 

    constructor(name:string, restaurant_ID:string, pin:string, address:string, description:string, start_time:string, end_time:string, closed_days:string, active:boolean, table_ID:string) {
        this.name = name
        this.restaurant_ID = restaurant_ID
        this.pin = pin
        this.address = address
        this.description = description
        this.start_time = start_time
        this.end_time = end_time
        this.closed_days = closed_days
        this.active = active
        this.table_ID = table_ID
    }

    toString() {
        return this.name 
    }
}

export class Table {
    table_num: number
    num_seats:number
    table_ID : number
    restaurant_ID : number
    //There will be more here 

    constructor(table_num:number, num_seats:number, table_ID:number, restaurant_ID:number) {
        this.table_num = table_num
        this.num_seats = num_seats
        this.table_ID = table_ID
        this.restaurant_ID = restaurant_ID
    }

    toString() {
        return this.table_num, this.num_seats, this.table_ID, this.restaurant_ID
    }
}

export class Reservation {
    confirmation_ID : number
    date : Date
    time : String
    num_guests : number
    email : String
    restaurant_ID_reser : number
    table_ID : number
    //There will be more here 

    constructor(confirmation_ID:number, date:Date, time:String, num_guests:number, email:String, restaurant_ID_reser:number, table_ID:number) {
        this.confirmation_ID = confirmation_ID
        this.date = date
        this.time = time
        this.num_guests = num_guests
        this.email = email
        this.restaurant_ID_reser = restaurant_ID_reser
        this.table_ID = table_ID
    }

    toString() {
        return this.confirmation_ID, this.date, this.time, this.num_guests, this.email, this.restaurant_ID_reser, this.table_ID
    }
}

export class AvailabilityInfo {
    util_per : number
    avail_per : number 
    availability_list : Array<String[]>
    date_array : string[]

    constructor(util_per:number, avail_per:number, availability_list:Array<String[]>, date_array: string[]) {
        this.util_per = util_per
        this.avail_per = avail_per
        this.availability_list = availability_list
        this.date_array = date_array
    }

    toString() {
        return this.util_per, this.avail_per, this.availability_list
    }   

}

