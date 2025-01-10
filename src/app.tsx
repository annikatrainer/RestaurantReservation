import React from "react";
import reactDom from "react-dom";
import { BrowserRouter as Router ,Routes, Route, BrowserRouter } from "react-router-dom";

import ConsumerActive from "./app/consumerActive/page";
import CreateRestaurant from "./app/createRestaurant/page";
import Home from "./app/home/page";


function myCustomApp(){
  return(
    <BrowserRouter>
  <Router>
    <Routes>
      <Route path="/consumerActive" element={<ConsumerActive />} />
      <Route path="/createRestaurant" element={<CreateRestaurant />} />
      <Route path="/home" element={<Home />} />



    </Routes>
    </Router>
    </BrowserRouter>
  );

}
export default myCustomApp;
