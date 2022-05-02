import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

import '../../../index.css';
import { provider, getRequestStatus, getOpenedRequest } from '../../../assets/lib.js';

// export default class ShowResults extends React.Component {
//   componentDidMount() {
//     // this.initPageCharts();
//   }
//   constructor(props) {
//     super(props);
//   }

const govServices = {
  "0xd6F62BD1e8008AF11FF95DF1aceF3F511A27cDb2": "Service 1",
  "0x4C96C2e456778ed8d200C72Ed7E49D858B51bb00": "Service 2",
  "0x550bD56960Cc52Fe8E0B10d0cf48BF2603E1C7F6": "Service 3"
}

function genMessage(event) {
  if (event.type == "Opened") {
    return "A request was created";
  }
  return event.type;
}

//   render() {
const ShowResults = (props) => {
  const [requestStatus, setRequestStatus] = useState([]);
  const [openedRequests, setOpenedRequests] = useState([]);
  console.log(props)
  console.log("===============")
  // console.log(openedRequests);
  // useEffect(() => {
  //   getOpenedRequest(provider).then((res) => {
  //     setOpenedRequests(res);
  //   })
  // })
  useEffect(() => {
    getRequestStatus(provider, "0xf97dc7154fF4b4c5de388e8A6EB7e2Be6DA7edb7").then((res) => {
      setRequestStatus(res);
    })
  }, [])
  console.log(requestStatus);
  console.log("===============")

  function epochToDate(epoch) {
    let date = new Date(epoch*1000);
    return date.toLocaleString("el-CY");
  }

  return (
    <div className="container-fluid">
      <h2>Application # BT9A for Birth subsidy</h2>
      <table class="table">
        <tr>
          <th class="table__heading">Timestamp</th>
          <th class="table__heading">Authority</th>
          <th class="table__heading">Actions</th>
          <th class="table__heading">Notes</th>
        </tr>
        {requestStatus.length > 0 && (requestStatus).map((entry) => {
          return (
            <tr class="table__row">
              <td class="table__content" data-heading="Player">{epochToDate(entry.timestamp)}</td>
              <td class="table__content" data-heading="Seasons">{entry.service == undefined ? "N/A" : (govServices[entry.newHolder] == undefined ? entry.newHolder : govServices[entry.newHolder])}</td>
              <td class="table__content" data-heading="Seasons">{entry.type}</td>
              <td class="table__content" data-heading="Points">{genMessage(entry)}</td>
            </tr>
          )
        }
        )}
        {/* <tr class="table__row">
          <td class="table__content" data-heading="Player">30/4/22 12:13pm</td>
          <td class="table__content" data-heading="Seasons">KEP Larnacas</td>
          <td class="table__content" data-heading="Seasons">Accepted</td>
          <td class="table__content" data-heading="Points">All documents were signed here by both applicants</td>
        </tr>
        <tr class="table__row">
          <td class="table__content" data-heading="Player">30/4/22 1:09pm</td>
          <td class="table__content" data-heading="Seasons">KEP Larnacas</td>
          <td class="table__content" data-heading="Seasons">Submitted</td>
          <td class="table__content" data-heading="Points">Courier</td>
        </tr>
        <tr class="table__row">
          <td class="table__content" data-heading="Player">30/4/22 1:09pm</td>
          <td class="table__content" data-heading="Seasons">Goverment Courier #992</td>
          <td class="table__content" data-heading="Seasons">Accepted</td>
          <td class="table__content" data-heading="Points"></td>
        </tr>
        <tr class="table__row">
          <td class="table__content" data-heading="Player">30/4/22 2:01pm</td>
          <td class="table__content" data-heading="Seasons">Goverment Courier #992</td>
          <td class="table__content" data-heading="Seasons">Delivered</td>
          <td class="table__content" data-heading="Points"></td>
        </tr>
        <tr class="table__row">
          <td class="table__content" data-heading="Player">30/4/22 2:01pm</td>
          <td class="table__content" data-heading="Seasons">Social Insurance Service</td>
          <td class="table__content" data-heading="Seasons">Accepted</td>
          <td class="table__content" data-heading="Points"></td>
        </tr> */}
      </table>

    </div>
  );
}

export default ShowResults;
