/* eslint-disable react/prop-types */
import { Accordion } from "react-bootstrap"
import UserDataTable from "./Darts/UserDataTable";

function MyAccordion({ game }) {
  console.log(game);
  return (
    <Accordion data-bs-theme="dark">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Live Data</Accordion.Header>
        <Accordion.Body>
          <UserDataTable game={game}/>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}

export default MyAccordion