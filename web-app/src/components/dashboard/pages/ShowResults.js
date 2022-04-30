import React from 'react';

import '../../../index.css';


export default class ShowResults extends React.Component {
  componentDidMount() {
    // this.initPageCharts();
  }
  constructor(props) {
    super(props);
  }


  render() {
    console.log(this.props)
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
        <tr class="table__row">
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
        </tr>
      </table>
        
      </div>
    );
  }
}
