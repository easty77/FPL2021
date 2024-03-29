import React, { useState, useEffect } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Select,
  SelectItem
} from 'carbon-components-react';


const FPL2021Admin = ({predictorId}) => {


  return (
    <>
    <h1>Admin</h1>
    <a href="/FPL/servlet/ENEFPLServlet?action=download_fpl_fixtures" target="_blank">Fixtures</a><br />
    <a href="/FPL/servlet/ENEFPLServlet?action=download_fpl_bootstrap" target="_blank">Bootstrap</a><br />
    <a href="/FPL/servlet/ENEFPLServlet?action=update_predictions_score&output=json" target="_blank">Predictions</a><br />
    </>
  );
};
export default FPL2021Admin;
